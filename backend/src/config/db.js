const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  if (process.env.NODE_ENV === "test") {
    console.log("Test mode - Skip real MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(
      "mongodb+srv://an100277:AeeReISLciRp5Aqf@binhan.awftk.mongodb.net/DoAnCNPM?appName=binhan"
      // hoặc dùng process.env.MONGO_URI
    );

    console.log("MongoDB Connected....", conn.connection.host);
  } catch (error) {
    console.error("MongoDB Connection fail...", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
