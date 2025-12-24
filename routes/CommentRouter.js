const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();

router.post("/:photo_id", async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;

  if (!req.session || !req.session.user_id) {
    return res.status(401).send({ message: "User is not logged in" });
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
    return res.status(400).send({ message: "Comment cannot be empty" });
  }

  try {
    const photo = await Photo.findById(photo_id);

    if (!photo) {
      return res.status(404).send({ message: "Photo not found" });
    }
    const newComment = {
      comment: comment,
      user_id: req.session.user_id,
      date_time: new Date(),
    };

    photo.comments = photo.comments || [];
    photo.comments.push(newComment);
    await photo.save();

    res.status(200).send(photo);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;