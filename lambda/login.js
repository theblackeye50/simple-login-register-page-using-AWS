// login.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const USERS_TABLE = process.env.USERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

// setup DynamoDB v3 client
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": event.headers?.origin || "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  try {
    let body = event.body ? JSON.parse(event.body) : event;
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Email and password are required." }),
      };
    }

    const result = await dynamo.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { email },
      })
    );

    const user = result.Item;

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Invalid email or password." }),
      };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Invalid email or password." }),
      };
    }

    const token = jwt.sign(
      { email: user.email, userId: user.userId },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Login successful", token }),
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error." }),
    };
  }
};
