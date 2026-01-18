// Vercel Serverless Function for Player Stats API with Blob storage
import { put, list } from '@vercel/blob';

const STATS_BLOB_PATH = 'player-stats.json';

// Load player stats from Blob storage
async function loadStats() {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const statsBlob = blobs.find(b => b.pathname.endsWith('player-stats.json'));
    
    if (statsBlob) {
      const response = await fetch(statsBlob.url);
      if (response.ok) {
        const stats = await response.json();
        console.log('Player stats loaded successfully');
        return stats;
      }
    }
  } catch (error) {
    console.error('Error loading player stats:', error);
  }
  
  return [];
}

// Save player stats to Blob storage
async function saveStats(statsData) {
  try {
    // Delete old stats blob first
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const oldStatsBlob = blobs.find(b => b.pathname.endsWith('player-stats.json'));
    if (oldStatsBlob) {
      const { del } = await import('@vercel/blob');
      try {
        await del(oldStatsBlob.url, {
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        console.log('Deleted old player stats blob');
      } catch (e) {
        console.log('Could not delete old stats:', e.message);
      }
    }
    
    const blob = await put(STATS_BLOB_PATH, JSON.stringify(statsData, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json'
    });
    
    console.log('Player stats saved successfully:', blob.url);
    return blob;
  } catch (error) {
    console.error('Error saving player stats:', error);
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
    
    // POST - Minecraft mod updates player stats
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
        console.log('Unauthorized stats update attempt');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      
      if (!req.body || !Array.isArray(req.body)) {
        return res.status(400).json({ success: false, message: 'Stats data must be an array' });
      }
      
      await saveStats(req.body);
      console.log(`Player stats updated - ${req.body.length} players`);
      return res.status(200).json({ success: true, message: 'Stats updated successfully' });
    }
    
    // GET - Website fetches player stats
    if (req.method === 'GET') {
      const stats = await loadStats();
      
      // Sort by username
      stats.sort((a, b) => a.username.localeCompare(b.username));
      
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      return res.status(200).json({ 
        success: true, 
        players: stats,
        totalPlayers: stats.length
      });
    }
    
    return res.status(405).json({ success: false, message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Stats API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}