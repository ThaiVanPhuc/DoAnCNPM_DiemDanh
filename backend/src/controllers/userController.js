const User = require('../models/userModel');

// Lấy tất cả user
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserByUserId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await User.findOne({ userId: id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const updateUserByUserId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await User.findOneAndUpdate({ userId: id }, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUserByUserId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await User.findOneAndDelete({ userId: id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUserByUserId,
  updateUserByUserId,
  deleteUserByUserId,
  getAllUsers,
  createUser,
};

