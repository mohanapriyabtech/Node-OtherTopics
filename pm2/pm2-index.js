const express = require('express');
const pm2 = require('pm2');
const path = require('path');
const fs = require('fs/promises');
const app = express();

// Connect to the PM2 daemon
pm2.connect((err) => {
  if (err) {
    console.error('Error connecting to PM2:', err);
    process.exit(1);
  }

  console.log('Connected to PM2');

  // Start a PM2 process
  app.get('/start', (req, res) => {
    pm2.start('app.js', (err, apps) => {
      if (err) {
        console.error('Error starting process:', err);
        return res.status(500).json({ error: 'Failed to start process' });
      }

      res.json({ message: 'Process started successfully' });
    });
  });

  // Stop a PM2 process
  app.get('/stop', (req, res) => {
    pm2.stop('app', (err, proc) => {
      if (err) {
        console.error('Error stopping process:', err);
        return res.status(500).json({ error: 'Failed to stop process' });
      }

      res.json({ message: 'Process stopped successfully' });
    });
  });

  
  // API endpoint to get PM2 stdout logs
  app.get('/logs/success', (req, res) => {
    pm2.describe('app', (err, processes) => {
      if (err || !processes || !processes[0] || !processes[0].pm2_env || !processes[0].pm2_env.pm_out_log_path) {
        console.error('Error getting stdout log path:', err);
        return res.status(500).json({ error: 'Failed to get stdout log path' });
      }

      const logPath = path.join(processes[0].pm2_env.pm_out_log_path, 'out.log');
      fs.readFile(logPath, 'utf8')
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          console.error('Error reading stdout log file:', err);
          res.status(500).json({ error: 'Failed to read stdout log file' });
        });
    });
  });

  // API endpoint to get PM2 stderr logs
  app.get('/logs/err', (req, res) => {
    pm2.describe('app', (err, processes) => {
      if (err || !processes || !processes[0] || !processes[0].pm2_env || !processes[0].pm2_env.pm_err_log_path) {
        console.error('Error getting stderr log path:', err);
        return res.status(500).json({ error: 'Failed to get stderr log path' });
      }

      const logPath = path.join(processes[0].pm2_env.pm_err_log_path, 'error.log');
      fs.readFile(logPath, 'utf8')
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          console.error('Error reading stderr log file:', err);
          res.status(500).json({ error: 'Failed to read stderr log file' });
        });
    });
  });

  // List all PM2 processes
  app.get('/list', (req, res) => {
    pm2.list((err, list) => {
      if (err) {
        console.error('Error listing processes:', err);
        return res.status(500).json({ error: 'Failed to list processes' });
      }

      res.json(list);
    });
  });

  // Start the Express server
  app.listen(4000, () => {
    console.log('Server running on port 4000');
  });
});

// Handle PM2 disconnect on process exit
process.on('exit', () => {
  pm2.disconnect();
});
