const express = require("express");
const cors = require("cors");
const app = express();

// Add this before your routes
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Your routes here

// If you have custom handling for OPTIONS, ensure it responds with status 200
app.options("*", cors());
