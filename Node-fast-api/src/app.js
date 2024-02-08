const express = require('express');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const axios = require('axios');
const fs = require('fs');


const app = express();
const port = 3000;

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/test');
const db = mongoose.connection;

// Define a schema for your data
const dataSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  // Add more fields as needed
});

// Create a model based on the schema
const DataModel = mongoose.model('Data', dataSchema);

// Function to generate fake data
function createRandomUser() {
  return {
    userId: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past(),
  };
}

// Endpoint to insert 1 lakh fake data
app.get('/insertFakeData', async (req, res) => {
  try {
    // Generate and insert 1 lakh fake data into MongoDB using Mongoose
    console.time('insertLargeFakeData');
    const fakeData = Array.from({ length: 100000 }, createRandomUser);
    const result = await DataModel.insertMany(fakeData);
    console.timeEnd('insertLargeFakeData');

    res.json({ success: true, message: `Inserted ${result.length} fake data entries into MongoDB.` });
  } catch (error) {
    console.error(`Error inserting fake data: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// Endpoint to retrieve fake data with time and size measurement
app.get('/getFakeData', async (req, res) => {
  try {
    // Measure the time it takes to retrieve fake data from MongoDB using Mongoose
    console.time('getFakeData');
    const fakeData = await DataModel.find().lean()
    console.timeEnd('getFakeData');

    // Calculate the size of the data
    const dataSizeInBytes = Buffer.from(JSON.stringify(fakeData)).length;
    const dataSizeInMB = dataSizeInBytes / (1024 * 1024);

    console.log(dataSizeInBytes,dataSizeInMB,"aaa")

    res.json({ success: true, sizeInBytes: dataSizeInBytes, sizeInMB: dataSizeInMB, data: fakeData });
  } catch (error) {
    console.error(`Error retrieving fake data: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


app.get('/getFakerData', async (req, res) => {
  try {
    // Define the API endpoint you want to request
    const apiUrl = 'https://devapi.realworld.fi/api/v1/user/nfts'; // Replace this with your actual API endpoint

    const origin = 'http://localhost:4200'; // Replace this with your actual origin

    axios.get(apiUrl, { headers: { 'Origin': origin } })
  .then(response => {

      const apiResponseData = response.data;

      const apiResponseSchema = generateSchema(apiResponseData);

      // Create a model based on the dynamically generated schema
      const ApiResponseModel = mongoose.model('ApiResponse', apiResponseSchema);

      // Store the response data in MongoDB using Mongoose
      ApiResponseModel.create(apiResponseData, (err, savedData) => {
          if (err) {
            console.error(`Error saving data to MongoDB: ${err.message}`);
          } else {
            console.log('API response data has been saved to MongoDB:', savedData);
          }
        });
      })

    .catch(error => {
      console.error(`Error making API request: ${error.message}`);
    });

  } catch (error) {
    console.error(`Error retrieving fake data: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



function generateSchema(responseData) {
  const schemaFields = {};

  // Iterate over keys in the response data and infer types
  for (const key in responseData) {
    const value = responseData[key];
    const type = typeof value;

    // Map JavaScript types to Mongoose schema types
    switch (type) {
      case 'number':
        schemaFields[key] = Number;
        break;
      case 'string':
        schemaFields[key] = String;
        break;
      case 'boolean':
        schemaFields[key] = Boolean;
        break;
      // Add more cases for other types if needed
      default:
        schemaFields[key] = String; // Default to String for unknown types
    }
  }

  return new mongoose.Schema(schemaFields);
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
