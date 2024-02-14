// Import the AWS SDK
const AWS = require('aws-sdk');

// config
const config = require('./.config');

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

// Name of your DynamoDB table
const tableName = 'User';

// Define the scan parameters
const scanParams = {
  TableName: tableName,
};



// ***************************************************

// For Chat Table
const params = {
  TableName: 'Chat',
  FilterExpression: 'cpid = :partitionKey',
  ExpressionAttributeValues: {
    ':partitionKey': 'a' // Replace 'a' with the partition key value you want to scan for
  }
};

dynamodb.scan(params, (err, data) => {
  if (err) {
    console.error('Unable to scan table:', err);
  } else {
    console.log('Scan succeeded:', data);
    console.log(data.Items[0].msgContent)
    // Process the scanned items here
  }
});


// NOTE For User Table
// ***************************************************


// const itemParams = {
//     TableName: tableName,
//     Item: {
//       // Define the attributes of the item
//       'school': { S: 'ucsd' }, // Replace 'primaryKey' with your actual primary key attribute name and 'value1' with the value
//       'uid': { N: '1' }, // Replace 'attribute1' with your actual attribute name and '123' with the value
//       // Add more attributes as needed
//       'background': { S: 'ffffff'},
//       'email': { S: 'test2@ucsd.edu'},
//       'emailNotification': { BOOL: false},
//       'font': { S: 'testFont'},
//       'interactions': { M: {
//         "likedPost": {
//           L: []
//         },
//         "savedPost": {
//           L: []
//         },
//         "createdPost": {
//           L: []
//         },
//         "commentedPost": {
//           L: [
//             {
//               N: "0"
//             }
//           ]
//         },
//       }},
//       'nickname': { S: 'testNickname2'},
//       'password': { S: 'testPassword2'}
//     },
//   };

// // Add the item to the table
// dynamodb.putItem(itemParams, (err, data) => {
//     if (err) {
//       console.error('Unable to add item to the table. Error JSON:', JSON.stringify(err, null, 2));
//     } else {
//       console.log('Item added successfully:', JSON.stringify(data, null, 2));
//     }
// });


// ***************************************************


// Scan items from the table --> scans the entire table and returns all items that match the specified criteria
// dynamodb.scan(scanParams, (err, data) => {
//   if (err) {
//     console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
//   } else {
//     console.log('Scan succeeded.');
//     data.Items.forEach((item) => {
//       console.log('Item:', JSON.stringify(item, null, 2));
//     });
//   }
// });


// ***************************************************


// const updateParams = {
//   TableName: tableName,
//   Key: {
//     'school': { S: 'ucsd' }, // Primary key attribute name and value
//     'uid': { N: '0' } // Sort key attribute name and value
//   },
//   UpdateExpression: 'SET #background = :newBackground', // Update expression to set the new value of num-like attribute
//   ExpressionAttributeNames: {
//     '#background': 'background' // Using ExpressionAttributeNames to handle attribute name containing hyphen
//   },
//   ExpressionAttributeValues: {
//     ':newBackground': { S: 'f0f0f0' } // New value for the num-like attribute
//   },
//   ReturnValues: 'ALL_NEW'
// };


// // Update the item in the table
// dynamodb.updateItem(updateParams, (err, data) => {
//   if (err) {
//     console.error('Unable to update item in the table. Error JSON:', JSON.stringify(err, null, 2));
//   } else {
//     console.log('Item updated successfully:', JSON.stringify(data, null, 2));
//   }
// });


// ***************************************************


// retrieves a single item from the table based on its primary key (combination of partition & sort key)
// const getParams = {
//   TableName: tableName,
//   Key: {
//     'school': { S: 'ucsd' }, // Primary key attribute name and value
//     'uid': { N: '0' } // Sort key attribute name and value
//   },
// };


// dynamodb.getItem(getParams, (err, data) => {
//   if (err) {
//     console.error('Unable to get item from the table. Error JSON:', JSON.stringify(err, null, 2));
//   } else {
//     console.log('Item retrieved successfully:', JSON.stringify(data.Item, null, 2));
//   }
// });
