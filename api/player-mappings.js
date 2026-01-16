// Vercel Serverless Function for Player Mappings API with Blob storage
import { put, list } from '@vercel/blob';

const PLAYER_MAPPINGS_BLOB_PATH = 'player-mappings.json';

// Load player mappings from Blob storage
async function loadPlayerMappings() {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const mappingsBlob = blobs.find(b => b.pathname.endsWith('player-mappings.json'));
    
    if (mappingsBlob) {
      const response = await fetch(mappingsBlob.url);
      if (response.ok) {
        const mappings = await response.json();
        console.log('Player mappings loaded successfully');
        return mappings;
      }
    }
  } catch (error) {
    console.error('Error loading player mappings:', error);
  }
  
  return {};
}

// Save player mappings to Blob storage
async function savePlayerMappings(mappingsData) {
  try {
    // Delete old mappings blob first
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const oldMappingsBlob = blobs.find(b => b.pathname.endsWith('player-mappings.json'));
    if (oldMappingsBlob) {
      const { del } = await import('@vercel/blob');
      try {
        await del(oldMappingsBlob.url, {
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        console.log('Deleted old player mappings blob');
      } catch (e) {
        console.log('Could not delete old mappings:', e.message);
      }
    }
    
    const blob = await put(PLAYER_MAPPINGS_BLOB_PATH, JSON.stringify(mappingsData, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json'
    });
    
    console.log('Player mappings saved successfully:', blob.url);
    return blob;
  } catch (error) {
    console.error('Error saving player mappings:', error);
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
    
    // POST - Bot updates player mappings
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
        console.log('Unauthorized player mappings update attempt');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      
      if (!req.body) {
        return res.status(400).json({ success: false, message: 'No mappings data provided' });
      }
      
      await savePlayerMappings(req.body);
      console.log('Player mappings updated by bot');
      return res.status(200).json({ success: true, message: 'Player mappings updated successfully' });
    }
    
    // GET - Minecraft mod or website fetches player mappings
    if (req.method === 'GET') {
      const mappings = await loadPlayerMappings();
      
      // Transform to array format for easier consumption
      const mappingsArray = Object.entries(mappings).map(([discordId, data]) => ({
        discordId,
        java: data.java,
        bedrock: data.bedrock || null,
        discordUsername: data.discord_username || `User_${discordId}`
      }));
      
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      return res.status(200).json({ 
        success: true, 
        mappings: mappingsArray,
        totalPlayers: mappingsArray.length
      });
    }
    
    return res.status(405).json({ success: false, message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Player Mappings API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}