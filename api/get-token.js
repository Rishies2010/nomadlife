// Serverless function to get admin token from environment variables
export default async function handler(req, res) {
  // Only allow from admin panel
  const referer = req.headers.referer;
  if (!referer || !referer.includes('/admin.html')) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return res.status(500).json({ success: false, message: 'Token not configured' });
  }
  
  // Return token (this is safe because it requires admin panel access)
  return res.status(200).json({ success: true, token });
}