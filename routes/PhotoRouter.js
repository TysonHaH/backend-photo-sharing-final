// routes/PhotoRouter.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");

const {
  Types: { ObjectId },
} = mongoose;

// GET /photosOfUser/:id
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  // 1. Kiểm tra format id
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid user id format." });
  }

  try {
    // 2. Kiểm tra user có tồn tại không
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(400).send({ message: "User not found." });
    }

    // 3. Lấy tất cả ảnh của user này
    const photos = await Photo.find(
      { user_id: id },
      "_id user_id comments file_name date_time"
    ).lean();

    // 4. Thu thập tất cả user_id của người comment
    const commenterIdsSet = new Set();
    photos.forEach((photo) => {
      (photo.comments || []).forEach((c) => {
        if (c.user_id) commenterIdsSet.add(String(c.user_id));
      });
    });
    const commenterIds = Array.from(commenterIdsSet);

    // 5. Lấy thông tin các user đã comment (chỉ field cần thiết)
    const commenters = await User.find(
      { _id: { $in: commenterIds } },
      "_id first_name last_name"
    ).lean();

    // 6. Tạo map id → user info
    const commentersMap = {};
    commenters.forEach((u) => {
      commentersMap[String(u._id)] = {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name,
      };
    });

    // 7. Build kết quả theo đúng format API
    const resultPhotos = photos.map((photo) => {
      const newComments = (photo.comments || []).map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: commentersMap[String(c.user_id)] || null,
      }));

      return {
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments: newComments,
      };
    });

    // 8. Trả về
    res.status(200).json(resultPhotos);
  } catch (err) {
    console.error("Error in /photosOfUser/:id:", err);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
