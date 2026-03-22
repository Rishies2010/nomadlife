
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    console.error('ADMIN_TOKEN environment variable is not set!');
    return res.status(500).json({ 
      success: false, 
      message: 'Token not configured. Please set ADMIN_TOKEN in Vercel environment variables.' 
    });
  }
  
  // Return token
  return res.status(200).json({ success: true, token });
}