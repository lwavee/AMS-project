// PM2 Ecosystem Configuration for Permanent 24/7 Production Deployment
// To run:
//   npm install -g pm2
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup

const path = require('path');

module.exports = {
  apps: [
    {
      name: "ams-backend",
      cwd: path.join(__dirname, "backend"),
      script: process.platform === "win32"
        ? path.join(__dirname, "backend", "venv", "Scripts", "uvicorn.exe")
        : "uvicorn",
      args: "app.main:app --host 0.0.0.0 --port 8000 --workers 2",
      interpreter: "none",
      autorestart: true,
      watch: false,
      max_restarts: 100,
      min_uptime: "10s",
      restart_delay: 2000,
      env: {
        NODE_ENV: "production",
        PYTHONUNBUFFERED: "1"
      },
      error_file: path.join(__dirname, "logs", "backend-error.log"),
      out_file: path.join(__dirname, "logs", "backend-out.log"),
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
    {
      name: "ams-frontend",
      cwd: path.join(__dirname, "frontend"),
      script: "npm",
      args: "start",
      autorestart: true,
      watch: false,
      max_restarts: 100,
      min_uptime: "10s",
      restart_delay: 2000,
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      },
      error_file: path.join(__dirname, "logs", "frontend-error.log"),
      out_file: path.join(__dirname, "logs", "frontend-out.log"),
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
