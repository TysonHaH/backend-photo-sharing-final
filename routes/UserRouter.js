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
      '_id last_name location description occupation'
    ).lean();

    if (!user) {
      return res.status(400).send({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
});
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,  
    );
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).send(error);
  }
});


module.exports = router;