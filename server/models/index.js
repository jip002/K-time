'use strict';

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/.config');
const db = {};

// Set the AWS region
AWS.config.update({ region: 'us-west-1' });

// Set your AWS credentials
const credentials = new AWS.Credentials({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
});

// Assign the credentials to the AWS configuration
AWS.config.credentials = credentials;

// Create a DynamoDB client
const dynamodb = new AWS.DynamoDB.DocumentClient();

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(dynamodb, AWS); // Pass DynamoDB instance to models
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.dynamodb = dynamodb; // Add DynamoDB instance to exported object

module.exports = db;
