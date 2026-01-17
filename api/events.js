// Vercel Serverless Function for Discord Events API with Blob storage
import { put, list } from '@vercel/blob';

const EVENTS_BLOB_PATH = 'events.json';

// Load events from Blob storage
async function loadEvents() {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const eventsBlob = blobs.find(b => b.pathname.endsWith('events.json'));
    
    if (eventsBlob) {
      const response = await fetch(eventsBlob.url);
      if (response.ok) {
        const events = await response.json();
        console.log('Events loaded successfully');
        return events;
      }
    }
  } catch (error) {
    console.error('Error loading events:', error);
  }
  
  return [];
}

// Save events to Blob storage
async function saveEvents(eventsData) {
  try {
    // Delete old events blob first
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const oldEventsBlob = blobs.find(b => b.pathname.endsWith('events.json'));
    if (oldEventsBlob) {
      const { del } = await import('@vercel/blob');
      try {
        await del(oldEventsBlob.url, {
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        console.log('Deleted old events blob');
      } catch (e) {
        console.log('Could not delete old events:', e.message);
      }
    }
    
    const blob = await put(EVENTS_BLOB_PATH, JSON.stringify(eventsData, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json'
    });
    
    console.log('Events saved successfully:', blob.url);
    return blob;
  } catch (error) {
    console.error('Error saving events:', error);
    throw error;
  }
}

// Main API handler
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set!');
      return res.status(500).json({ 
        success: false, 
        message: 'Blob storage not configured.' 
      });
    }
    
    // POST - Bot updates events data
    if (req.method === 'POST') {
      if (!process.env.BOT_SECRET) {
        console.error('BOT_SECRET is not set!');
        return res.status(500).json({ 
          success: false, 
          message: 'Bot secret not configured.' 
        });
      }
      
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${process.env.BOT_SECRET}`) {
        console.log('Unauthorized events update attempt');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      
      if (!req.body || !Array.isArray(req.body)) {
        return res.status(400).json({ success: false, message: 'Events data must be an array' });
      }
      
      await saveEvents(req.body);
      console.log(`Events data updated by bot - ${req.body.length} events`);
      return res.status(200).json({ success: true, message: 'Events updated successfully' });
    }
    
    // GET - Website fetches events data
    if (req.method === 'GET') {
      const events = await loadEvents();
      
      // Filter to show scheduled, active events (hide completed/cancelled)
      const activeEvents = events
        .filter(event => {
          // Show if status is scheduled or active, hide completed/cancelled
          return event.status === 'scheduled' || event.status === 'active';
        })
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      return res.status(200).json({ 
        success: true, 
        events: activeEvents,
        totalEvents: events.length,
        upcomingEvents: activeEvents.length
      });
    }
    
    return res.status(405).json({ success: false, message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Events API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}