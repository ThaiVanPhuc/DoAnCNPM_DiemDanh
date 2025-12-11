const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, 
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const userSchema = new mongoose.Schema({
  userId: { 
    type: Number, 
    unique: true 
  }, 
  fullName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: 
    true, 
    unique: true 
  },
  password: { 
    type: String 
  },
  phone: { 
    type: String 
  },
  avatarUrl: { 
    type: String 
  },
  address: { 
    type: String 
  },
  gender: { 
    type: String, 
    enum: ['male', 'female'], 
    default: 'male' 
  },
  birthday: {
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  role: { 
    type: String, 
    enum: ['ADMIN', 'STUDENT', 'TEACHER'], 
    default: 'STUDENT' 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class' 
  },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.pre('save', async function() {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      'user',               
      { $inc: { seq: 1 } },  
      { new: true, upsert: true } 
    );
    this.userId = counter.seq;
  }
});

module.exports = mongoose.model('User', userSchema);
