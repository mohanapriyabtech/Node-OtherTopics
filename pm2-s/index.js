
const http = require('http');
const logger = require('./logger');

const server = http.createServer((req, res) => {
  if (req.url === '/restart' && req.method === 'POST') {
    logger.info('Restarting application...');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Restarting application...' }));

    setTimeout(() => {
      process.exit(0);
    }, 1000); // Restart after 1 second
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
  }
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log("hello")
  logger.info(`Server running at http://localhost:${PORT}`);
});


