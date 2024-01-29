/* eslint-disable no-console */
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import admin from "firebase-admin";
import indexRouter from "./routes/index.js";
import { connectToDB } from "./utils.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const serviceAccount = JSON.parse(
  fs.readFileSync(
    "nursing-project-66060-firebase-adminsdk-zvv2q-1e64e650f8.json"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Add other Firebase configuration options here if needed
});
// const express = require('express');
// const passport = require('passport');
// const { MongoClient } = require('mongodb');
// const { Strategy: MicrosoftStrategy } = require('passport-microsoft');

// const app = express();
// app.use(express.json());

// // Set up MongoDB connection
// const client = new MongoClient('mongodb+srv://kzstar:root@cluster0.vowlw1a.mongodb.net/test');
// let db;

// client.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MongoDB:', err);
//     process.exit(1);
//   }

//   db = client.db('test');
// });

// // Configure Passport.js with Microsoft Strategy
// passport.use(
//   new MicrosoftStrategy(
//     {
//       clientID: 'YOUR_CLIENT_ID',
//       clientSecret: 'YOUR_CLIENT_SECRET',
//       callbackURL: 'http://localhost:3000/auth/microsoft/callback',
//       scope: ['User.Read'],
//       tenantIdOrName: 'YOUR_TENANT_ID',
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Check if the user's email is from University of Windsor
//       const email = profile.emails[0].value;
//       const isUWindsorEmail = email.endsWith('@uwindsor.ca');

//       if (isUWindsorEmail) {
//         // Store the user in the database or perform any other necessary actions
//         db.collection('users').insertOne({ email });

//         // Return the user
//         return done(null, { email });
//       }

//       // If the user is not from University of Windsor, return an error
//       return done(new Error('Only University of Windsor emails are allowed.'));
//     }
//   )
// );

// // Initialize Passport.js
// app.use(passport.initialize());

// // Redirect the user to Microsoft login page
// app.get('/auth/microsoft', passport.authenticate('microsoft'));

// // Handle the Microsoft callback
// app.get(
//   '/auth/microsoft/callback',
//   passport.authenticate('microsoft', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//   })
// );

// // Start the server
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
const PORT = process.env.PORT || 8000;

dotenv.config();

const app = express();
app.use(bodyParser.json());
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(cookieParser());

app.use(
  session({
    secret: "drthrthvfr",
    saveUninitialized: true,
    resave: true,
  })
);

app.use("/api", indexRouter);

(async function init() {
  try {
    await connectToDB();
    app.listen(PORT, () => console.log("Express is listening at port", PORT));
  } catch (err) {
    console.warn(err);
  }
})();
