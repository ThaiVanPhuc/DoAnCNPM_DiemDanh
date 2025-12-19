const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    //   const conn = await mongoose.connect(
    //   "mongodb+srv://an100277:AeeReISLciRp5Aqf@binhan.awftk.mongodb.net/DoAnCNPM?appName=binhan"
    // );

    const conn = await mongoose.connect("mongodb://localhost:27017/");

    console.log("MongoDB Connected....", conn.connection.host);
  } catch (error) {
    console.error("MongoDB Connection fail...", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
