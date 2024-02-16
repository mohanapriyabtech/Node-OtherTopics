const express = require('express');
const winston = require('winston');
const path = require('path');
const fs = require('fs/promises');

const cors = require("cors");
const app = express();

app.use(cors());

// In-memory storage for simplicity (replace with a database in a real application)
let books = [
  { id: 1, title: 'Book 1', author: 'Author 1' },
  { id: 2, title: 'Book 2', author: 'Author 2' },
];

// Create a logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
fs.mkdir(logsDir, { recursive: true })
  .then(() => console.log('Logs directory created'))
  .catch((err) => console.error('Error creating logs directory:', err));

// Configure Winston to log to a file
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'out.log') }),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
  ],
});

// Log requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Log errors to the error log file
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  next(err);
});

// Object to hold all route handlers and functions
const routes = {
  getBooks: (req, res) => {
    res.json(books);
  },

  // Other route handlers...

};

app.get('/', (req, res) => {
  logger.info('GET /');
  res.json("hello pm2");
});

app.get('/books', (req, res) => {
  logger.info('GET /books');
  routes.getBooks(req, res);
});

// Route to get all logs with date and time
app.get('/logs', async (req, res) => {
  try {
    const outLogPath = path.join(logsDir, 'out.log');
    const errorLogPath = path.join(logsDir, 'error.log');

    const [outLogData, errorLogData] = await Promise.all([
      fs.readFile(outLogPath, 'utf8'),
      fs.readFile(errorLogPath, 'utf8')
    ]);

    const logs = parseLogs(outLogData, errorLogData);
    res.send(logs.join('<br>'));
  } catch (err) {
    logger.error('Error reading log files:', err);
    res.status(500).json({ error: 'Failed to read log files' });
  }
});

function parseLogs(outLogData, errorLogData) {
  const outLogs = outLogData.split('\n').map(log => {
    const [timestamp, message] = log.split(']: ');
    return `<span style="color:green;">${timestamp.replace('[', '')}</span>: ${message}`;
  });

  const errorLogs = errorLogData.split('\n').map(log => {
    const [timestamp, message] = log.split(']: ');
    return `<span style="color:red;">${timestamp.replace('[', '')}</span>: ${message}`;
  });

  return outLogs.concat(errorLogs).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





// const express = require('express');
// const pm2 = require('pm2');
// const path = require('path');
// const fs = require('fs/promises');

// const cors = require("cors")
// const app = express();

// app.use(cors())

// // In-memory storage for simplicity (replace with a database in a real application)
// let books = [
//   { id: 1, title: 'Book 1', author: 'Author 1' },
//   { id: 2, title: 'Book 2', author: 'Author 2' },
// ];

// const logsDir = path.join(__dirname, 'logs'); 


// fs.mkdir(logsDir, { recursive: true })
//   .then(() => console.log('Logs directory created'))
//   .catch((err) => console.error('Error creating logs directory:', err));

// // Object to hold all route handlers and functions
// const routes = {
//   startPM2: () => {
//     console.log("start pm2")
//     pm2.connect((err) => {
//       if (err) {
//         console.error(err);
//         process.exit(1);
//       }

//       console.log('Connected to PM2');

//       const options = {
//         name: 'user-list',
//         script: 'app.js',
//         output: path.join(logsDir, 'out.log'),
//         error: path.join(logsDir, 'error.log')
//       };

//       pm2.start(options, (err) => {
//         if (err) {
//           console.error(err);
//           process.exit(1);
//         }

//         console.log('Application started successfully with PM2.');
//         pm2.disconnect();
//                         });
//                     });
      

//   },

//   getBooks: (req, res) => {
//     console.log("books")
//     res.json(books);
//   },

//   getBookById: (req, res) => {
//     const bookId = parseInt(req.params.id);
//     const book = books.find((b) => b.id === bookId);
//     if (!book) {
//       return res.status(404).json({ message: 'Book not found' });
//     }
//     res.json(book);
//   },

//   createBook: (req, res) => {
//     const { title, author } = req.body;
//     const id = books.length + 1;
//     const newBook = { id, title, author };
//     books.push(newBook);
//     res.status(201).json(newBook);
//   },

//   updateBook: (req, res) => {
//     const bookId = parseInt(req.params.id);
//     const { title, author } = req.body;
//     const bookIndex = books.findIndex((b) => b.id === bookId);
//     if (bookIndex === -1) {
//       return res.status(404).json({ message: 'Book not found' });
//     }
//     books[bookIndex] = { id: bookId, title, author };
//     res.json(books[bookIndex]);
//   },

//   deleteBook: (req, res) => {
//     const bookId = parseInt(req.params.id);
//     const bookIndex = books.findIndex((b) => b.id === bookId);
//     if (bookIndex === -1) {
//       return res.status(404).json({ message: 'Book not found' });
//     }
//     const deletedBook = books.splice(bookIndex, 1);
//     res.json(deletedBook[0]);
//   },

//   getLogs: (req, res) => {
//     const logPath = path.join(__dirname, 'logs', 'out.log');
//     fs.readFile(logPath, 'utf8')
//       .then((data) => {
//         // res.send(data);
//         res.send(`<pre>${data}</pre>`);
//       })
//       .catch((err) => {
//         console.error('Error reading stdout log file:', err);
//         res.status(500).json({ error: 'Failed to read stdout log file' });
//       });
//   },

//   getErrorLogs: (req, res) => {
//     const logPath = path.join(__dirname, 'logs', 'error.log');
//     fs.readFile(logPath, 'utf8')
//       .then((data) => {
//         // res.send(data);
//         res.send(`<pre>${data}</pre>`);
//       })
//       .catch((err) => {
//         console.error('Error reading stderror log file:', err);
//         res.status(500).json({ error: 'Failed to read stderr log file' });
//       });
//   }
// };

// // Route to get all logs with date and time
// app.get('/logs', async (req, res) => {
//   try {
//     const logsDir = path.join(__dirname, 'logs');
//     const outLogPath = path.join(logsDir, 'out.log');
//     const errorLogPath = path.join(logsDir, 'error.log');

//     const [outLogData, errorLogData] = await Promise.all([
//       fs.readFile(outLogPath, 'utf8'),
//       fs.readFile(errorLogPath, 'utf8')
//     ]);

//     const logs = parseLogs(outLogData, errorLogData);
//     res.json(logs);
//   } catch (err) {
//     console.error('Error reading log files:', err);
//     res.status(500).json({ error: 'Failed to read log files' });
//   }
// });

// // Function to parse and format logs with date and time
// function parseLogs(outLogData, errorLogData) {
//   const outLogs = outLogData.split('\n').map(log => {
//     const [timestamp, message] = log.split(']: ');
//     return { timestamp: timestamp.replace('[', ''), message, type: 'success' };
//   });

//   const errorLogs = errorLogData.split('\n').map(log => {
//     const [timestamp, message] = log.split(']: ');
//     return { timestamp: timestamp.replace('[', ''), message, type: 'error' };
//   });

//   return outLogs.concat(errorLogs).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
// }


// // Route to get all logs in a single page
// app.get('/all-logs', async (req, res) => {
//   try {
//     const logsDir = path.join(__dirname, 'logs');
//     const outLogPath = path.join(logsDir, 'out.log');
//     const errorLogPath = path.join(logsDir, 'error.log');

//     const [outLogData, errorLogData] = await Promise.all([
//       fs.readFile(outLogPath, 'utf8'),
//       fs.readFile(errorLogPath, 'utf8')
//     ]);

//     const logs = parseLogs(outLogData, errorLogData);
//     const logLines = logs.map(log => `${log.timestamp}: ${log.message}`).join('<br>');
//     const html = `<html><body>${logLines}</body></html>`;
//     res.send(html);
//   } catch (err) {
//     console.error('Error reading log files:', err);
//     res.status(500).json({ error: 'Failed to read log files' });
//   }
// });

// // Define routes
// app.get('/', (req, res) => {
//   res.json("hello pm2");
// });

// app.get('/books', routes.getBooks);
// app.get('/books/:id', routes.getBookById);
// app.post('/books', routes.createBook);
// app.put('/books/:id', routes.updateBook);
// app.delete('/books/:id', routes.deleteBook);
// app.get('/success/logs', routes.getLogs);
// app.get('/error/logs', routes.getErrorLogs);

// // Start the Express server
// app.listen(5000, () => {
//   console.log('Server running on port 5000');
//   routes.startPM2();
// });

