const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../db/userModel");

const {
  Types: { ObjectId },
} = mongoose;

router.get('/list', async (req, res) => {
  try {
    const users = await User.find({}, '_id first_name last_name').lean();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching user list:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
});


router.get('/:id', async (req, res) => {
  const id = req.params.id;

  // 1. Check id format
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid user id format.' });
  }

  try {
    const user = await User.findById(
      id,
      '_id first_name last_name location description occupation'
    ).lean();

    if (!user) {
      return res.status(400).send({ message: 'User not found.' });
    }
    // user đã là plain object với đúng field cần dùng
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

router.post("/pass/:id", async (req, res) => {
  const id = req.params.id;
  const { current_password, new_password } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.password !== current_password) {
      return res.status(400).send({ message: "Incorrect current password" });
    }

    user.password = new_password;
    await user.save();
    res.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;