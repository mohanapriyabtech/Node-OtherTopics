const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

// Create a rate limiter that allows 10 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  message: 'Too many requests, please try again later.',
});

const requestCounts = {};

// Function to create a rate limiter middleware for specific endpoints
const createRateLimiter = () => {
    return (req, res, next) => {
        const key = req.ip + ':' + req.path;
        requestCounts[key] = requestCounts[key] || { count: 0, timestamp: Date.now() };
        const { count, timestamp } = requestCounts[key];

        // If the last request was more than 1 minute ago, reset the count
        if (Date.now() - timestamp > 60 * 1000) {
            requestCounts[key] = { count: 1, timestamp: Date.now() };
        } else {
            // Increment the count
            requestCounts[key].count++;
        }

        // Check if the count exceeds the limit
        if (requestCounts[key].count > 10) {
            return res.status(429).send('Too many requests, please try again later. Max requests allowed: 10');
        }

        next();
    };
};

// Apply the rate limiter middleware to all routes
app.use(createRateLimiter());


// Define your routes
app.get('/api/endpoint1', (req, res) => {
  res.send('Endpoint 1');
});

app.get('/api/endpoint2', (req, res) => {
  res.send('Endpoint 2');
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});