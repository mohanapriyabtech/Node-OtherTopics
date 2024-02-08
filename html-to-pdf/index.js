// app.js

const express = require('express');
const wkhtmltopdf = require('node-wkhtmltopdf');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();


const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});


app.get('/html-to-pdf', async (req, res) => {
    try {
      const htmlUrl = "/home/sparkout/Documents/projects/Node-Task/html-to-pdf/sample.html";
      const outputPath = "/home/sparkout/Documents/projects/Node-Task/html-to-pdf/sample.pdf";
  
      const result = await wkhtmltopdf(htmlUrl, [{ output: outputPath }]); // Fix: Pass options as an array
      console.log('PDF generated successfully:', outputPath);
      res.send('PDF generated successfully'); // Send response to the client
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating PDF'); // Send error response to the client
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
