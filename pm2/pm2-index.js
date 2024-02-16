const express = require('express');
const pm2 = require('pm2');
const path = require('path');
const fs = require('fs/promises');

const cors = require("cors")
const app = express();

app.use(cors())

// // Connect to the PM2 daemon
// pm2.connect((err) => {
//   if (err) {
//     console.error('Error connecting to PM2:', err);
//     process.exit(1);
//   }

//   console.log('Connected to PM2');


//   // Listen for messages from the managed processes
// pm2.launchBus(function(err, bus) {
//     if (err) {
//         console.error(err);
//         return;
//     }

//     // Handle log messages from processes
//     bus.on('log:out', function(packet) {
//         console.log('Log (stdout):', packet.data);
//     });

//     bus.on('log:err', function(packet) {
//         console.error('Log (stderr):', packet.data);
//     });
// });


const logsDir = path.join(__dirname, 'logs'); // Path to the logs directory

// Ensure that the logs directory exists
fs.mkdir(logsDir, { recursive: true })
  .then(() => console.log('Logs directory created'))
  .catch((err) => console.error('Error creating logs directory:', err));

const options = {
    name: 'user-list',
    script: 'app.js',
    output: path.join(logsDir, 'out.log'),
    error: path.join(logsDir, 'error.log')
};


// let pm2Started = false;

const startPM2 = () => {
    console.log("start pm2")
    pm2.connect((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        pm2.start(options, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }

            console.log('Application started successfully with PM2.');
            pm2Started = true;
            pm2.disconnect();
        });
    });
};


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


  // app.get('/logs/success', (req, res) => {
  //   const logPath = path.join(__dirname, 'logs', 'out.log');
  //   fs.readFile(logPath, 'utf8')
  //     .then((data) => {
  //       res.send(data);
  //     })
  //     .catch((err) => {
  //       console.error('Error reading stdout log file:', err);
  //       res.status(500).json({ error: 'Failed to read stdout log file' });
  //     });
  // });
  
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
    startPM2();
    
  });
// });

// Handle PM2 disconnect on process exit
process.on('exit', () => {
  pm2.disconnect();
});
