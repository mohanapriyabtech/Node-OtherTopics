// app.js

const express = require('express');
const { S3 } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const File = require('./file-upload-model')
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();


const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

class S3Upload {
  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
    });
    this.bucketName = process.env.S3_BUCKET_NAME;

    // Validate required environment variables
    if (!this.s3 || !this.bucketName) {
      throw new Error('S3 configuration is missing');
    }
  }

  async upload(service, file, fileType, fileName) {
    const imageFolderName = uuidv4();
    const name = fileName || `${file.md5}-${Date.now()}.${file.name.split('.').pop()}`;
    const uploadPath = `uploads/${service}/${imageFolderName}/${name}`;

    const s3Params = {
      Bucket: this.bucketName,
      Key: uploadPath,
      Body: file.data,
      ContentType: file.mimetype,
    };

    try {
      const uploadResult = await this.s3.upload(s3Params).promise();
      if (uploadResult && uploadResult.Location) {
        const url = uploadResult.Location;
        await storeFile(url, service, fileType);
        return { name: file.name, url, file_type: fileType };
      } else {
        throw new Error('S3 upload failed');
      }
    } catch (error) {
      throw error;
    }
  }
}

const s3Upload = new S3Upload();

app.post('/image-upload', async (req, res) => {
  try {
    // Assuming 'service' and 'fileType' are sent in the request
    const result = await s3Upload.upload(req.body.service, req.files.file, req.body.fileType, req.body.fileName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const storeFile = async (file, service, fileType) => {
  const fileModel = new File({ file, service_type: service, file_type: fileType });

  try {
    const result = await fileModel.save();
    return result;
  } catch (error) {
    throw error;
  }
};

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
