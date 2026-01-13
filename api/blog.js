import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper to hash password
function hashPassword(password) {
  const salt = process.env.BLOG_SALT || 'default_salt_change_me';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Get blogs directory
function getBlogsDir() {
  const dir = path.join('/tmp', 'data', 'blogs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Get config directory
function getDataDir() {
  const dir = path.join('/tmp', 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getConfigPath() {
  return path.join(getDataDir(), 'config.json');
}

function loadConfig() {
  const configPath = getConfigPath();
  
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config;
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  
  // Default config if file doesn't exist or error
  const defaultConfig = { 
    password: hashPassword('admin123'),
    blogs: [] 
  };
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  } catch (error) {
    console.error('Error creating default config:', error);
  }
  
  return defaultConfig;
}

function saveConfig(config) {
  try {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

function saveBlog(blog) {
  try {
    const blogsDir = getBlogsDir();
    const filePath = path.join(blogsDir, `${blog.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(blog, null, 2));
  } catch (error) {
    console.error('Error saving blog:', error);
  }
}

function loadAllBlogs() {
  try {
    const blogsDir = getBlogsDir();
    
    if (!fs.existsSync(blogsDir)) {
      return [];
    }
    
    const files = fs.readdirSync(blogsDir).filter(f => f.endsWith('.json'));
    const blogs = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(blogsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const blog = JSON.parse(content);
        blogs.push(blog);
      } catch (error) {
        console.error(`Error loading blog file ${file}:`, error);
      }
    }
    
    return blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error loading blogs:', error);
    return [];
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { action } = req.query;
  
  try {
    let body = {};
    if (req.method === 'POST' && req.body) {
      body = req.body;
    }
    
    console.log('API Action:', action);
    
    switch (action) {
      case 'get_blogs':
        const blogs = loadAllBlogs();
        return res.status(200).json({ success: true, blogs });
        
      case 'login':
        const { password } = body;
        
        if (!password) {
          return res.status(400).json({ success: false, message: 'Password is required' });
        }
        
        const config = loadConfig();
        const hashedInput = hashPassword(password);
        
        console.log('Login attempt - Input hash:', hashedInput.substring(0, 10) + '...');
        console.log('Stored hash:', config.password.substring(0, 10) + '...');
        
        if (hashedInput === config.password) {
          return res.status(200).json({ success: true });
        } else {
          return res.status(401).json({ success: false, message: 'Invalid password' });
        }
        
      case 'create_blog':
        const { title, content, excerpt, files = [], authToken } = body;
        
        if (!authToken || authToken !== process.env.ADMIN_TOKEN) {
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
        const { blogId, authToken: deleteToken } = body;
        
        if (!deleteToken || deleteToken !== process.env.ADMIN_TOKEN) {
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
        const { oldPassword, newPassword, authToken: passwordToken } = body;
        
        if (!passwordToken || passwordToken !== process.env.ADMIN_TOKEN) {
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