// Vercel Serverless Function for Player Stats API with MySQL
import mysql from 'mysql2/promise';

async function getConnection() {
  return await mysql.createConnection({
    host: 'panel.freezehost.pro',
    port: 3306,
    user: 'u19005_bFu2x8G20Q',
    password: 'H14r0m=2@NtWjvdsD.E+HLu7',
    database: 's19005_nomadlife'
  });
}

// Authorization check for POST requests
function isAuthorized(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  const expectedToken = 'nomadlifepower'; // Same as in PlayerStatsManager.java
  
  return token === expectedToken;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  let connection;
  
  try {
    connection = await getConnection();
    
    if (req.method === 'GET') {
      // Handle GET request (read stats)
      const [stats] = await connection.execute('SELECT uuid, username, stats_json FROM player_stats ORDER BY username ASC');
      
      const players = stats.map(s => ({
        uuid: s.uuid,
        username: s.username,
        stats: JSON.parse(s.stats_json || '{}')
      }));
      
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      return res.status(200).json({ 
        success: true, 
        players: players,
        totalPlayers: players.length
      });
      
    } else if (req.method === 'POST') {
      // Handle POST request (write stats from Minecraft mod)
      
      // Check authorization
      if (!isAuthorized(req)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Invalid or missing token' 
        });
      }
      
      const statsData = req.body;
      
      if (!Array.isArray(statsData)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid data: Expected array of player stats' 
        });
      }
      
      let updatedCount = 0;
      let insertedCount = 0;
      
      // Process each player's stats
      for (const playerStat of statsData) {
        const { uuid, username, stats } = playerStat;
        
        if (!uuid || !username || !stats) {
          console.warn('Invalid player stat entry:', playerStat);
          continue;
        }
        
        // Check if player already exists
        const [existing] = await connection.execute(
          'SELECT id FROM player_stats WHERE uuid = ?',
          [uuid]
        );
        
        const statsJson = JSON.stringify(stats);
        
        if (existing.length > 0) {
          // Update existing record
          await connection.execute(
            'UPDATE player_stats SET username = ?, stats_json = ?, last_updated = NOW() WHERE uuid = ?',
            [username, statsJson, uuid]
          );
          updatedCount++;
        } else {
          // Insert new record
          await connection.execute(
            'INSERT INTO player_stats (uuid, username, stats_json) VALUES (?, ?, ?)',
            [uuid, username, statsJson]
          );
          insertedCount++;
        }
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Stats updated successfully',
        inserted: insertedCount,
        updated: updatedCount,
        totalProcessed: statsData.length
      });
      
    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Stats API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Database error: ' + error.message 
    });
  } finally {
    if (connection) await connection.end();
  }
}