// Vercel Serverless Function for Blog API with MySQL
import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Helper to hash password
function hashPassword(password) {
  const salt = process.env.BLOG_SALT || 'default_salt_change_me';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

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

// Load config from database
async function loadConfig(connection) {
  try {
    const [rows] = await connection.execute(
      'SELECT config_key, config_value FROM blog_config'
    );
    
    const config = {};
    for (const row of rows) {
      config[row.config_key] = row.config_value;
    }
    
    // If no password exists, create default
    if (!config.password) {
      const defaultPassword = hashPassword('admin123');
      await connection.execute(
        'INSERT INTO blog_config (config_key, config_value) VALUES (?, ?)',
        ['password', defaultPassword]
      );
      config.password = defaultPassword;
    }
    
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    return { password: hashPassword('admin123') };
  }
}

// Save config to database
async function saveConfig(connection, key, value) {
  try {
    await connection.execute(
      'INSERT INTO blog_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?',
      [key, value, value]
    );
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

// Load all blogs from database
async function loadAllBlogs(connection) {
  try {
    const [blogs] = await connection.execute(
      'SELECT * FROM blog_posts ORDER BY date DESC'
    );
    
    return blogs.map(blog => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      date: blog.date,
      files: blog.files_json ? JSON.parse(blog.files_json) : []
    }));
  } catch (error) {
    console.error('Error loading blogs:', error);
    return [];
  }
}

// Save blog to database
async function saveBlog(connection, blog) {
  try {
    const filesJson = JSON.stringify(blog.files || []);
    
    await connection.execute(
      'INSERT INTO blog_posts (id, title, content, excerpt, date, files_json) VALUES (?, ?, ?, ?, ?, ?)',
      [blog.id, blog.title, blog.content, blog.excerpt, blog.date, filesJson]
    );
    
    return true;
  } catch (error) {
    console.error('Error saving blog:', error);
    throw error;
  }
}

// Delete blog from database
async function deleteBlog(connection, blogId) {
  try {
    const [result] = await connection.execute(
      'DELETE FROM blog_posts WHERE id = ?',
      [blogId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
}

// Main API handler
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { action } = req.query;
  
  let connection;
  try {
    let body = {};
    if (req.method === 'POST' && req.body) {
      body = req.body;
    }
    
    console.log('API Action:', action);
    
    connection = await getConnection();
    
    switch (action) {
      case 'get_blogs':
        const blogs = await loadAllBlogs(connection);
        return res.status(200).json({ success: true, blogs });
        
      case 'login':
        const { password } = body;
        
        if (!password) {
          return res.status(400).json({ success: false, message: 'Password is required' });
        }
        
        const config = await loadConfig(connection);
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
        
        if (!process.env.ADMIN_TOKEN) {
          console.error('ADMIN_TOKEN is not set!');
          return res.status(500).json({ 
            success: false, 
            message: 'Admin token not configured.' 
          });
        }
        
        if (!authToken || authToken !== process.env.ADMIN_TOKEN) {
          console.log('Auth failed');
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
        
        await saveBlog(connection, newBlog);
        return res.status(200).json({ success: true, blog: newBlog });
        
      case 'delete_blog':
        const { blogId, authToken: deleteToken } = body;
        
        if (!process.env.ADMIN_TOKEN) {
          console.error('ADMIN_TOKEN is not set!');
          return res.status(500).json({ 
            success: false, 
            message: 'Admin token not configured.' 
          });
        }
        
        if (!deleteToken || deleteToken !== process.env.ADMIN_TOKEN) {
          console.log('Auth failed');
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        if (!blogId) {
          return res.status(400).json({ success: false, message: 'Blog ID is required' });
        }
        
        const deleted = await deleteBlog(connection, blogId);
        if (deleted) {
          return res.status(200).json({ success: true });
        } else {
          return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        
      case 'change_password':
        const { oldPassword, newPassword, authToken: passwordToken } = body;
        
        if (!process.env.ADMIN_TOKEN) {
          console.error('ADMIN_TOKEN is not set!');
          return res.status(500).json({ 
            success: false, 
            message: 'Admin token not configured.' 
          });
        }
        
        if (!passwordToken || passwordToken !== process.env.ADMIN_TOKEN) {
          console.log('Auth failed');
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        if (!oldPassword || newPassword) {
          return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
        }
        
        const currentConfig = await loadConfig(connection);
        const hashedOldInput = hashPassword(oldPassword);
        
        console.log('Password change - Old hash:', hashedOldInput.substring(0, 10) + '...');
        console.log('Stored hash:', currentConfig.password.substring(0, 10) + '...');
        
        if (hashedOldInput !== currentConfig.password) {
          return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        const hashedNewPassword = hashPassword(newPassword);
        await saveConfig(connection, 'password', hashedNewPassword);
        
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
  } finally {
    if (connection) await connection.end();
  }
}