// Vercel Serverless Function for Teams API with Blob storage
import { put, list } from '@vercel/blob';

const TEAMS_BLOB_PATH = 'teams.json';

// Load teams from Blob storage
async function loadTeams() {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const teamsBlob = blobs.find(b => b.pathname === 'teams.json' || b.pathname.endsWith('teams.json'));
    
    if (teamsBlob) {
      const response = await fetch(teamsBlob.url);
      if (response.ok) {
        const teams = await response.json();
        console.log('Teams loaded successfully from:', teamsBlob.pathname);
        return teams;
      }
    }
    
    console.log('No teams found in blob storage yet');
  } catch (error) {
    console.error('Error loading teams:', error);
  }
  
  // Return empty object if no teams found
  return {};
}

// Save teams to Blob storage
async function saveTeams(teamsData) {
  try {
    const blob = await put(TEAMS_BLOB_PATH, JSON.stringify(teamsData, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json',
      addRandomSuffix: false
    });
    
    console.log('Teams saved successfully:', blob.url);
    return blob;
  } catch (error) {
    console.error('Error saving teams:', error);
    throw error;
  }
}

// Main API handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Check if BLOB token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set!');
      return res.status(500).json({ 
        success: false, 
        message: 'Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN in environment variables.' 
      });
    }
    
    // POST - Bot updates teams data
    if (req.method === 'POST') {
      // Check bot secret for authentication
      if (!process.env.BOT_SECRET) {
        console.error('BOT_SECRET is not set!');
        return res.status(500).json({ 
          success: false, 
          message: 'Bot secret not configured. Please set BOT_SECRET in environment variables.' 
        });
      }
      
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${process.env.BOT_SECRET}`) {
        console.log('Unauthorized team update attempt');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      
      if (!req.body) {
        return res.status(400).json({ success: false, message: 'No teams data provided' });
      }
      
      await saveTeams(req.body);
      console.log('Teams data updated by bot');
      return res.status(200).json({ success: true, message: 'Teams updated successfully' });
    }
    
    // GET - Website fetches teams data
    if (req.method === 'GET') {
      const teams = await loadTeams();
      
      // Transform teams data for frontend display
      const teamsArray = Object.entries(teams).map(([roleId, teamData]) => {
        // Handle both old format (just IDs) and new format (objects with username)
        const members = (teamData.members || []).map(member => {
          if (typeof member === 'object' && member.id && member.username) {
            return member; // New format
          }
          return { id: member, username: null }; // Old format
        });
        
        const leaderData = teamData.leader_data || { 
          id: teamData.leader, 
          username: null 
        };
        
        return {
          roleId,
          name: teamData.name,
          leader: leaderData,
          members: members,
          createdAt: teamData.created_at,
          memberCount: members.length
        };
      });
      
      // Cache for 1 minute
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      return res.status(200).json({ 
        success: true, 
        teams: teamsArray,
        totalTeams: teamsArray.length,
        totalMembers: teamsArray.reduce((sum, t) => sum + t.memberCount, 0)
      });
    }
    
    return res.status(405).json({ success: false, message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Teams API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}