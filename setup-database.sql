-- OGame Automation Database Setup Script
-- Run this as root or admin user in your MariaDB

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ogame CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user for the application
CREATE USER IF NOT EXISTS 'ogame_user'@'%' IDENTIFIED BY 'example';

-- Grant privileges
GRANT ALL PRIVILEGES ON ogame.* TO 'ogame_user'@'%';
FLUSH PRIVILEGES;

-- Use the ogame database
USE ogame;

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS task_result;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS bot;
DROP TABLE IF EXISTS universe;
DROP TABLE IF EXISTS user_account;

-- User accounts table
CREATE TABLE user_account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    disabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_access_at TIMESTAMP NULL
);

-- Universe table
CREATE TABLE universe (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    discord_webhook VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bot table
CREATE TABLE bot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    universe_id BIGINT NOT NULL,
    name VARCHAR(100),
    last_seen_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (universe_id) REFERENCES universe(id) ON DELETE CASCADE
);

-- Task table
CREATE TABLE task (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('CHECK_ACTIVITY', 'SPY_PLAYER') NOT NULL,
    status ENUM('CREATED', 'IN_PROGRESS', 'FINISHED', 'ERROR') NOT NULL DEFAULT 'CREATED',
    universe_id BIGINT NOT NULL,
    bot_id BIGINT NULL,
    player_name VARCHAR(100),
    parameters JSON,
    recurrence_minutes INT NULL,
    next_execution_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    FOREIGN KEY (universe_id) REFERENCES universe(id) ON DELETE CASCADE,
    FOREIGN KEY (bot_id) REFERENCES bot(id) ON DELETE SET NULL,
    INDEX idx_task_status_universe (status, universe_id),
    INDEX idx_task_next_execution (next_execution_at)
);

-- Task result table
CREATE TABLE task_result (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    success BOOLEAN NOT NULL,
    full_result TEXT,
    error_message TEXT,
    execution_time_ms BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE
);

-- Insert default admin user (password: thisisjustanexamplepassword)
INSERT INTO user_account (username, password_hash, role, disabled) 
VALUES ('admin', '$2b$10$1ddD5fz5RvbtoJtJwdkZ/.en.R4HwlgIS9AXnldz2B4LOSqGrgC76', 'ADMIN', false);

-- Insert sample universe
INSERT INTO universe (name, url, discord_webhook) 
VALUES ('Universe 1', 'https://s1-pt.ogame.gameforge.com/', 'https://discord.com/api/webhooks/your-webhook-here');

-- Insert sample bot
INSERT INTO bot (uuid, universe_id, name) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 1, 'Test Bot');

-- Insert sample tasks
INSERT INTO task (type, universe_id, player_name, recurrence_minutes) 
VALUES 
    ('CHECK_ACTIVITY', 1, 'TestPlayer1', 60),
    ('SPY_PLAYER', 1, 'TestPlayer2', NULL),
    ('CHECK_ACTIVITY', 1, 'TestPlayer3', 30);

-- Show created tables
SHOW TABLES;

-- Show some sample data
SELECT 'Users:' as Info;
SELECT id, username, role, disabled, created_at FROM user_account;

SELECT 'Universes:' as Info;
SELECT id, name, url, created_at FROM universe;

SELECT 'Bots:' as Info;
SELECT id, uuid, universe_id, name, created_at FROM bot;

SELECT 'Tasks:' as Info;
SELECT id, type, status, universe_id, player_name, recurrence_minutes, created_at FROM task;

SELECT 'Database setup completed successfully!' as Status;
