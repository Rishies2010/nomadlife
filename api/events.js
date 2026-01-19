// Vercel Serverless Function for Discord Events API with MySQL
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    let connection;
    try {
      connection = await getConnection();
      
      const [events] = await connection.execute('SELECT * FROM discord_events ORDER BY start_time ASC');
      
      // Filter to show scheduled and active events only
      const activeEvents = events
        .filter(event => event.status === 'scheduled' || event.status === 'active')
        .map(event => ({
          id: event.event_id,
          name: event.name,
          description: event.description || '',
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location || 'Discord',
          status: event.status,
          creator: event.creator,
          user_count: event.user_count || 0,
          image_url: event.image_url
        }));
      
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      return res.status(200).json({ 
        success: true, 
        events: activeEvents,
        totalEvents: events.length,
        upcomingEvents: activeEvents.length
      });
    } catch (error) {
      console.error('Events API Error:', error);
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