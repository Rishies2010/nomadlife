import { put, list } from '@vercel/blob';

const TEAMS_BLOB_PATH = 'teams.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Bot updates teams data
      if (req.headers.authorization !== `Bearer ${process.env.BOT_SECRET}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await put(TEAMS_BLOB_PATH, JSON.stringify(req.body, null, 2), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: 'application/json'
      });

      return res.status(200).json({ success: true });
    }

    // GET request - fetch teams for website
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const teamsBlob = blobs.find(b => b.pathname.endsWith('teams.json'));
    
    if (teamsBlob) {
      const response = await fetch(teamsBlob.url);
      const teams = await response.json();
      
      res.setHeader('Cache-Control', 's-maxage=60'); // cache 1min
      return res.status(200).json({ success: true, teams });
    }

    return res.status(200).json({ success: true, teams: {} });
    
  } catch (error) {
    console.error('Teams API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}