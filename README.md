# Fullstack Login — HTML/CSS/TypeScript frontend + AWS API Gateway + Lambda + DynamoDB
## 🔹 1.Project Overview
The project is a full-stack login and registration system.
Frontend: Simple login/register form using HTML, CSS, TypeScript.
Backend: Serverless APIs using AWS API Gateway + Lambda.
Database: DynamoDB to store user credentials securely.
Authentication: Secure password storage (hashing + salting) and JWT tokens for login sessions.
## 🔹 2. Frontend (User Interface)
A single web page (index.html) with:
Login/Register toggle (switch between the two modes).
Input fields for email/username and password.
Button to submit form.
A message area to show success/error messages.
CSS ensures the page looks clean and user-friendly.
TypeScript (app.ts) handles:
Switching between login/register.
Sending API requests (via fetch) to API Gateway.
Displaying server responses (e.g., “User created”, “Login successful”).
Temporarily storing JWT token (in localStorage or cookies).
👉 In production, this frontend can be hosted on AWS S3 + CloudFront as a static site.
## 🔹 3. Backend (AWS Lambda + API Gateway)
API Gateway exposes 2 routes:
POST /register → handled by register.js
POST /login → handled by login.js
Lambda functions:
Register:
Checks if user exists in DynamoDB.
Hashes the password with bcryptjs.
Stores {email, userId, passwordHash, createdAt} in DynamoDB.
Login:
Fetches user by email.
Validates password using bcrypt compare.
Issues a JWT token using jsonwebtoken.
👉 This setup is serverless, so you don’t manage servers — AWS handles scaling and execution.
## 🔹 4. Database (DynamoDB)
Table: Users
Partition Key: email
Attributes:
email (string, PK)
userId (UUID)
passwordHash (hashed password, never store plaintext)
createdAt (timestamp)
Provisioned as On-Demand Billing (pay-per-request).
## 🔹 5. Authentication Flow
Registration:
User enters email + password → sent to /register.
Backend hashes the password and stores it in DynomoDB.
Response: "User created".
Login:
User enters credentials → sent to /login.
Backend checks password against stored hash.
If correct → returns JWT token.
Client stores JWT for authenticated requests.
JWT Token:
Encodes user ID and email.
Used to verify the user in future API requests.

Configurable expiration (e.g., 1 hour)
