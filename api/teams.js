// Vercel Serverless Function for Teams API with MySQL
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
      
      const [teams] = await connection.execute('SELECT * FROM teams');
      
      const teamsArray = [];
      for (const team of teams) {
        const [members] = await connection.execute(
          'SELECT discord_id, username FROM team_members WHERE team_role_id = ?',
          [team.role_id]
        );
        
        teamsArray.push({
          roleId: team.role_id.toString(),
          name: team.name,
          leader: team.leader_id.toString(),
          leaderName: team.leader_name || `User_${team.leader_id}`,
          members: members.map(m => ({
            id: m.discord_id.toString(),
            username: m.username
          })),
          createdAt: team.created_at,
          memberCount: members.length
        });
      }
      
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      return res.status(200).json({ 
        success: true, 
        teams: teamsArray,
        totalTeams: teamsArray.length,
        totalMembers: teamsArray.reduce((sum, t) => sum + t.memberCount, 0)
      });
    } catch (error) {
      console.error('Teams API Error:', error);
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