-- init-db.sql - Database initialization script
-- This file documents the database schema
-- Note: server.js automatically creates this table on startup

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);

-- Insert default sample data (optional)
INSERT INTO todos (task, completed) VALUES
    ('Setup CI/CD Pipeline', true),
    ('Deploy to AWS', true),
    ('Integrate PostgreSQL Database', true),
    ('Deliver Amazing Presentation', false)
ON CONFLICT DO NOTHING;

-- Display created tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Display sample data
SELECT * FROM todos;