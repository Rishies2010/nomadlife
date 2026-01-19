import mysql from 'mysql2/promise';

async function getConnection() {
  return await mysql.createConnection({
    host: 'panel.freezehost.pro',
    port: 3306,
    user: 'u19005_bFu2x8G20Q',
    password: 'H14r0m=2@NtWjvdsD.E+HLu7',
    database: 's19005_nomadlife',
    supportBigNumbers: true,
    bigNumberStrings: true
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    let connection;
    try {
      connection = await getConnection();
      
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
    } catch (error) {
      console.error('Stats GET API Error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + error.message 
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  if (req.method === 'POST') {
    // Check authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization required' 
      });
    }
    
    const token = authHeader.substring(7);
    if (token !== 'nomadlifepower') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid authorization token' 
      });
    }
    
    let connection;
    try {
      const statsData = req.body;
      
      if (!Array.isArray(statsData)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid data format, expected array' 
        });
      }
      
      connection = await getConnection();
      
      // Begin transaction
      await connection.beginTransaction();
      
      // Insert or update each player's stats
      for (const player of statsData) {
        const { uuid, username, stats } = player;
        
        if (!uuid || !username) {
          console.warn('Skipping player without UUID or username:', player);
          continue;
        }
        
        // Check if player already exists
        const [existing] = await connection.execute(
          'SELECT id FROM player_stats WHERE uuid = ?',
          [uuid]
        );
        
        const statsJson = JSON.stringify(stats || {});
        
        if (existing.length > 0) {
          // Update existing record
          await connection.execute(
            'UPDATE player_stats SET username = ?, stats_json = ?, updated_at = NOW() WHERE uuid = ?',
            [username, statsJson, uuid]
          );
        } else {
          // Insert new record
          await connection.execute(
            'INSERT INTO player_stats (uuid, username, stats_json) VALUES (?, ?, ?)',
            [uuid, username, statsJson]
          );
        }
      }
      
      // Commit transaction
      await connection.commit();
      
      return res.status(200).json({ 
        success: true, 
        message: `Stats updated for ${statsData.length} players`,
        count: statsData.length
      });
      
    } catch (error) {
      // Rollback on error
      if (connection) await connection.rollback();
      console.error('Stats POST API Error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + error.message 
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  return res.status(405).json({ success: false, message: 'Method not allowed' });
}