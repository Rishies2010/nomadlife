// Vercel Serverless Function for blog API with Blob storage
import { put, del, list, head } from '@vercel/blob';
import crypto from 'crypto';

// Helper to hash password
function hashPassword(password) {
  const salt = process.env.BLOG_SALT || 'default_salt_change_me';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Blog storage paths
const CONFIG_BLOB_PATH = 'config.json';
const BLOG_PREFIX = 'blogs/';

// Load config from Blob
async function loadConfig() {
  try {
    // Try to get the config blob
    const { blobs } = await list({
      prefix: CONFIG_BLOB_PATH,
      limit: 1,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    if (blobs.length > 0) {
      // Config exists, fetch it
      const response = await fetch(blobs[0].url);
      if (response.ok) {
        const config = await response.json();
        console.log('Config loaded successfully');
        return config;
      }
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  
  // Default config if not exists
  console.log('Creating default config...');
  const defaultConfig = {
    password: hashPassword('admin123'),
    lastUpdated: new Date().toISOString()
  };
  
  // Save default config
  await saveConfig(defaultConfig);
  return defaultConfig;
}

// Save config to Blob
async function saveConfig(config) {
  try {
    const blob = await put(CONFIG_BLOB_PATH, JSON.stringify(config, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json'
    });
    console.log('Config saved successfully:', blob.url);
    return blob;
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}

// Load all blogs from Blob
async function loadAllBlogs() {
  try {
    const { blobs } = await list({
      prefix: BLOG_PREFIX,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const blogs = [];
    
    // Fetch each blog file
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        if (response.ok) {
          const blog = await response.json();
          blogs.push(blog);
        }
      } catch (error) {
        console.error(`Error loading blog ${blob.pathname}:`, error);
      }
    }
    
    // Sort by date, newest first
    blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log(`Loaded ${blogs.length} blogs`);
    return blogs;
  } catch (error) {
    console.error('Error loading blogs:', error);
    return [];
  }
}

// Save blog to Blob
async function saveBlog(blog) {
  try {
    const blobPath = `${BLOG_PREFIX}${blog.id}.json`;
    const blob = await put(blobPath, JSON.stringify(blog, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json'
    });
    console.log('Blog saved successfully:', blob.url);
    return blob;
  } catch (error) {
    console.error('Error saving blog:', error);
    throw error;
  }
}

// Delete blog from Blob
async function deleteBlog(blogId) {
  try {
    const blobPath = `${BLOG_PREFIX}${blogId}.json`;
    
    // First, get the URL of the blob to delete
    const { blobs } = await list({
      prefix: blobPath,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    if (blobs.length > 0) {
      await del(blobs[0].url, {
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      console.log('Blog deleted successfully:', blogId);
    } else {
      console.log('Blog not found:', blogId);
    }
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
}

// Main API handler
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
    
    // Check if BLOB token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set!');
      return res.status(500).json({ 
        success: false, 
        message: 'Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN in environment variables.' 
      });
    }
    
    switch (action) {
      case 'get_blogs':
        const blogs = await loadAllBlogs();
        return res.status(200).json({ success: true, blogs });
        
      case 'login':
        const { password } = body;
        
        if (!password) {
          return res.status(400).json({ success: false, message: 'Password is required' });
        }
        
        const config = await loadConfig();
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
        
        // Check auth token
        if (!process.env.ADMIN_TOKEN) {
          console.error('ADMIN_TOKEN is not set!');
          return res.status(500).json({ 
            success: false, 
            message: 'Admin token not configured. Please set ADMIN_TOKEN in environment variables.' 
          });
        }
        
        if (!authToken || authToken !== process.env.ADMIN_TOKEN) {
          console.log('Auth failed. Provided:', authToken ? 'yes' : 'no', 'Expected:', process.env.ADMIN_TOKEN ? 'yes' : 'no');
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
        
        await saveBlog(newBlog);
        return res.status(200).json({ success: true, blog: newBlog });
        
      case 'delete_blog':
        const { blogId, authToken: deleteToken } = body;
        
        // Check auth token
        if (!process.env.ADMIN_TOKEN) {
          console.error('ADMIN_TOKEN is not set!');
          return res.status(500).json({ 
            success: false, 
            message: 'Admin token not configured. Please set ADMIN_TOKEN in environment variables.' 
          });
        }
        
        if (!deleteToken || deleteToken !== process.env.ADMIN_TOKEN) {
          console.log('Auth failed. Provided:', deleteToken ? 'yes' : 'no', 'Expected:', process.env.ADMIN_TOKEN ? 'yes' : 'no');
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        if (!blogId) {
          return res.status(400).json({ success: false, message: 'Blog ID is required' });
        }
        
        await deleteBlog(blogId);
        return res.status(200).json({ success: true });
        
      case 'change_password':
        const { oldPassword, newPassword, authToken: passwordToken } = body;
        
        // Check auth token
        if (!process.env.ADMIN_TOKEN) {
          console.error('ADMIN_TOKEN is not set!');
          return res.status(500).json({ 
            success: false, 
            message: 'Admin token not configured. Please set ADMIN_TOKEN in environment variables.' 
          });
        }
        
        if (!passwordToken || passwordToken !== process.env.ADMIN_TOKEN) {
          console.log('Auth failed. Provided:', passwordToken ? 'yes' : 'no', 'Expected:', process.env.ADMIN_TOKEN ? 'yes' : 'no');
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const currentConfig = await loadConfig();
        const hashedOldInput = hashPassword(oldPassword);
        
        if (hashedOldInput !== currentConfig.password) {
          return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        currentConfig.password = hashPassword(newPassword);
        currentConfig.lastUpdated = new Date().toISOString();
        await saveConfig(currentConfig);
        
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
        
      default:
        return res.status(400).json({ success: false, message: 'Invalid action: ' + action });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message
    });
  }
}