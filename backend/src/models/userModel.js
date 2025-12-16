const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Counter = require("./counterModel");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    birthday: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "STUDENT", "TEACHER"],
      default: "STUDENT",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  },
  { timestamps: true }
);

// === CHỈ CÓ DUY NHẤT 1 PRE-SAVE HOOK NÀY THÔI ===
userSchema.pre("save", async function (next) {
  try {
    if (this.password && (this.isNew || this.isModified("password"))) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "user" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.userId = counter.seq;
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
