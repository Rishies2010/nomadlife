// Vercel Serverless Function for Teams API with Blob storage
// FIXED VERSION - Preserves Discord ID precision
import { put, list } from '@vercel/blob';

const TEAMS_BLOB_PATH = 'teams.json';

// Load teams from Blob storage
async function loadTeams() {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const teamsBlob = blobs.find(b => b.pathname.endsWith('teams.json'));
    
    if (teamsBlob) {
      const response = await fetch(teamsBlob.url);
      if (response.ok) {
        const teams = await response.json();
        console.log('Teams loaded successfully');
        return teams;
      }
    }
  } catch (error) {
    console.error('Error loading teams:', error);
  }
  
  return {};
}

// Save teams to Blob storage
async function saveTeams(teamsData) {
  try {
    // Delete old teams blob first
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const oldTeamsBlob = blobs.find(b => b.pathname.endsWith('teams.json'));
    if (oldTeamsBlob) {
      const { del } = await import('@vercel/blob');
      try {
        await del(oldTeamsBlob.url, {
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        console.log('Deleted old teams blob');
      } catch (e) {
        console.log('Could not delete old teams:', e.message);
      }
    }
    
    const blob = await put(TEAMS_BLOB_PATH, JSON.stringify(teamsData, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json'
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
    
    // POST - Bot updates teams data
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
        // Get leader ID - try leader_id first, then fall back to leader
        const leaderId = teamData.leader_id || teamData.leader;
        const leaderName = teamData.leader_name || `User_${leaderId}`;
        
        // Use member_details if bot sent it, otherwise use basic members array
        let members = [];
        if (teamData.member_details && Array.isArray(teamData.member_details)) {
          // Bot sent detailed info with usernames
          // CRITICAL: Keep IDs as strings to preserve precision!
          members = teamData.member_details.map(m => ({
            id: String(m.id),
            username: m.username
          }));
        } else if (teamData.members && Array.isArray(teamData.members)) {
          // Fallback to just IDs
          // CRITICAL: Keep IDs as strings to preserve precision!
          members = teamData.members.map(id => ({
            id: String(id),
            username: `User_${id}`
          }));
        }
        
        return {
          roleId,
          name: teamData.name || 'undefined',
          leader: String(leaderId), // Keep as string
          leaderName: leaderName,
          members: members,
          createdAt: teamData.created_at,
          memberCount: members.length
        };
      });
      
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