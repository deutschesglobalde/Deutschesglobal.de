-- Seed data for banking system

-- Insert admin user (password: admin111)
INSERT INTO public.admin_users (username, password_hash, role) VALUES 
('admin', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ', 'super_admin');

-- Note: In a real application, you would hash the password properly
-- For demo purposes, we'll handle password verification in the application
