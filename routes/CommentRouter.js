// routes/CommentRouter.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ message: "Comments API placeholder" });
});

module.exports = router;
