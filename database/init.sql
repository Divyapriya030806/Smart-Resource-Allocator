CREATE DATABASE IF NOT EXISTS resource_db;
USE resource_db;

CREATE TABLE IF NOT EXISTS servers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50),
  cpu_capacity INT DEFAULT 100,
  mem_capacity INT DEFAULT 100,
  current_cpu FLOAT DEFAULT 0,
  current_mem FLOAT DEFAULT 0,
  weight INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cpu_required INT NOT NULL,
  mem_required INT NOT NULL,
  priority INT DEFAULT 1,
  duration_ms INT DEFAULT 1000,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT,
  server_id INT,
  algorithm_used VARCHAR(50) DEFAULT 'Greedy Knapsack',
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (server_id) REFERENCES servers(id)
);

CREATE TABLE IF NOT EXISTS metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  server_id INT,
  cpu_percent FLOAT,
  mem_percent FLOAT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id)
);

INSERT INTO servers (name, ip_address, cpu_capacity, mem_capacity, weight, status) VALUES
('Server-Alpha', '192.168.1.1', 100, 100, 2, 'active'),
('Server-Beta',  '192.168.1.2', 100, 100, 1, 'active'),
('Server-Gamma', '192.168.1.3', 100, 100, 3, 'active'),
('Server-Delta', '192.168.1.4', 100, 100, 1, 'active');

INSERT INTO jobs (name, cpu_required, mem_required, priority, duration_ms, status) VALUES
('WebCrawler-Job',    30, 20, 3, 2000, 'pending'),
('DataPipeline-Job',  50, 60, 5, 5000, 'pending'),
('MLTraining-Job',    80, 75, 4, 8000, 'pending'),
('APIServer-Job',     15, 10, 2, 1000, 'pending'),
('BatchReport-Job',   40, 35, 1, 3000, 'pending');
