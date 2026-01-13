// Vercel Serverless Function for blog API
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + process.env.BLOG_SALT).digest('hex');
}

// Get blogs directory path
function getBlogsDir() {
  const dir = path.join(process.cwd(), 'data', 'blogs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getConfigPath() {
  return path.join(process.cwd(), 'data', 'config.json');
}

function loadConfig() {
  const configPath = getConfigPath();
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config;
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }
  const defaultConfig = { 
    password: hashPassword('admin123'), // Default password
    blogs: [] 
  };
  saveConfig(defaultConfig);
  return defaultConfig;
}

function saveConfig(config) {
  const configPath = getConfigPath();
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

function saveBlog(blog) {
  const blogsDir = getBlogsDir();
  const filePath = path.join(blogsDir, `${blog.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(blog, null, 2), 'utf8');
}

function loadBlog(blogId) {
  const blogsDir = getBlogsDir();
  const filePath = path.join(blogsDir, `${blogId}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return null;
}

function loadAllBlogs() {
  const blogsDir = getBlogsDir();
  if (!fs.existsSync(blogsDir)) return [];
  
  const files = fs.readdirSync(blogsDir).filter(f => f.endsWith('.json'));
  const blogs = files.map(file => {
    const content = fs.readFileSync(path.join(blogsDir, file), 'utf8');
    return JSON.parse(content);
  });
  
  return blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { action } = req.query;
  
  try {
    switch (action) {
      case 'get_blogs':
        const blogs = loadAllBlogs();
        return res.status(200).json({ success: true, blogs });
        
      case 'login':
        const { password } = req.body;
        const config = loadConfig();
        const hashedInput = hashPassword(password);
        
        if (hashedInput === config.password) {
          return res.status(200).json({ success: true });
        } else {
          return res.status(401).json({ success: false, message: 'Invalid password' });
        }
        
      case 'create_blog':
        const { title, content, excerpt, files = [], authToken } = req.body;
        
        if (authToken !== process.env.ADMIN_TOKEN) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        if (!title || !content) {
          return res.status(400).json({ success: false, message: 'Title and content are required' });
        }
        
        const newBlog = {
          id: Date.now().toString(),
          title: title.trim(),
          content: content.trim(),
          excerpt: (excerpt || content.substring(0, 150) + '...').trim(),
          date: new Date().toISOString(),
          files: Array.isArray(files) ? files : []
        };
        
        saveBlog(newBlog);
        return res.status(200).json({ success: true, blog: newBlog });
        
      case 'delete_blog':
        const { blogId, authToken: deleteToken } = req.body;
        
        if (deleteToken !== process.env.ADMIN_TOKEN) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        if (!blogId) {
          return res.status(400).json({ success: false, message: 'Blog ID is required' });
        }
        
        const blogsDir = getBlogsDir();
        const filePath = path.join(blogsDir, `${blogId}.json`);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return res.status(200).json({ success: true });
        } else {
          return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        
      case 'change_password':
        const { oldPassword, newPassword, authToken: passwordToken } = req.body;
        
        if (passwordToken !== process.env.ADMIN_TOKEN) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const currentConfig = loadConfig();
        const hashedOldInput = hashPassword(oldPassword);
        
        if (hashedOldInput !== currentConfig.password) {
          return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        currentConfig.password = hashPassword(newPassword);
        saveConfig(currentConfig);
        
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
        
      default:
        return res.status(400).json({ success: false, message: 'Invalid action: ' + action });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error'
    });
  }
}