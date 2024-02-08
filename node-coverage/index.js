// app.js or server.js

const express = require('express');
const app = express();
const PORT = 3000;

// Define a route that responds with "Hello, Express!"
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
