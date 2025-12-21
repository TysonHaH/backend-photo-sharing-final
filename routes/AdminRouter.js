const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// GET /admin/loggedin-user
router.get("/loggedin-user", async (req, res) => {
  if (!req.session || !req.session.user_id) {
    return res.status(401).send({ message: "Not logged in" });
  }

  try {
    const user = await User.findById(req.session.user_id).select("-password").lean();
    if (!user) {
      req.session.destroy();
      return res.status(401).send({ message: "User not found" });
    }
    user.login_name = user.username;
    res.status(200).send(user);
  } catch (error) {
    console.error("Error fetching logged in user:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// POST /admin/login
router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || !password) {
    return res.status(400).send({ message: "Login name and password are required" });
  }

  try {
    const user = await User.findOne({ username: login_name });

    if (!user) {
      return res.status(400).send({ message: "Invalid login name" });
    }
    if (user.password !== password) {
      return res.status(400).send({ message: "Invalid password" });
    }
    
    req.session.user_id = user._id;
    req.session.save();
    res.status(200).send({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.username,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// POST /admin/logout
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(400).send({ message: "Unable to log out" });
      }
      return res.status(200).send({ message: "Logout successful" });
    });
  } else {
    res.end();
  }
});

module.exports = router;