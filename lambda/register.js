// register.js - Updated for AWS SDK v3
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// 1. Initialize DynamoDB Client and Document Client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": event.headers?.origin || "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Email and password are required." }),
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userItem = {
      email,
      userId: uuidv4(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: USERS_TABLE,
      Item: userItem,
      ConditionExpression: "attribute_not_exists(email)",
    };

    await docClient.send(new PutCommand(params));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: "User registered successfully" }),
    };
  } catch (err) {
    console.error("Register error:", err);

    if (err.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ message: "User already exists" }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
