// server.js - Simple Todo API with PostgreSQL for CI/CD Demo
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'todoapp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection and create table if not exists
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    // Create todos table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if table is empty and add default todos
    const result = await client.query('SELECT COUNT(*) FROM todos');
    if (parseInt(result.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO todos (task, completed) VALUES
        ('Setup CI/CD Pipeline', true),
        ('Deploy to AWS', true),
        ('Deliver Amazing Presentation', false)
      `);
    }
    
    client.release();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    // Don't exit - allow health check to show database is down
  }
}

// Initialize database on startup
initializeDatabase();

// Health check endpoint (used by deployment script)
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create a new todo
app.post('/api/todos', async (req, res) => {
  const { task } = req.body;
  
  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO todos (task, completed) VALUES ($1, $2) RETURNING *',
      [task, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update a todo
app.put('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { task, completed } = req.body;
  
  try {
    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (task !== undefined) {
      updates.push(`task = $${paramCount}`);
      values.push(task);
      paramCount++;
    }
    
    if (completed !== undefined) {
      updates.push(`completed = $${paramCount}`);
      values.push(completed);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    const query = `UPDATE todos SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Todo API running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
    await pool.end();
    console.log('Database connections closed');
  });
}

module.exports = app;