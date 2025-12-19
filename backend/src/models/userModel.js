// src/models/userModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Counter = require("./counterModel");

const userSchema = new mongoose.Schema(
  {
    userId: { type: Number, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    avatarUrl: { type: String },
    address: { type: String },
    gender: { type: String, enum: ["male", "female"], default: "male" },
    birthday: { type: Date },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["ADMIN", "STUDENT", "TEACHER"],
      default: "STUDENT",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
  },
  { timestamps: true }
);

// === CÁCH HIỆN ĐẠI NHẤT – KHÔNG BAO GIỜ BỊ LỖI next is not a function ===
userSchema.pre("save", { document: true, query: false }, async function () {
  try {
    // Hash password
    if (this.isModified("password") || this.isNew) {
      if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
    }

    // Tăng userId tự động
    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "user" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.userId = counter.seq;
    }
  } catch (error) {
    throw error; // Mongoose sẽ tự handle lỗi
  }
});

module.exports = mongoose.model("User", userSchema);
