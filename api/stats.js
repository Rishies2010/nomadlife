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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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
      console.error('Stats API Error:', error);
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