const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/DoAnCNPM"
    );
    console.log("MongoDB Connected....", conn.connection.host);
  } catch (error) {
    console.error("MongoDB Connection fail...", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

   // const conn = await mongoose.connect(
    //   "mongodb+srv://an100277:AeeReISLciRp5Aqf@binhan.awftk.mongodb.net/DoAnCNPM?appName=binhan"
    // );