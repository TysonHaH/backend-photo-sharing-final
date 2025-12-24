// routes/PhotoRouter.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const multer = require("multer");
const path = require("path");
const uploadDir = path.join(__dirname, "../images");

const {
  Types: { ObjectId },
} = mongoose;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get("/count/:id", async(req,res) => {
  const id = req.params.id;
  try {
    const cnt = await Photo.countDocuments({user_id : id});
    res.status(200).send({count: cnt});
  } catch(err){
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid user id format." });
  }

  try {
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(400).send({ message: "User not found." });
    }

    const photos = await Photo.find(
      { user_id: id },
      "_id user_id comments file_name date_time"
    ).lean();

    const commenterIdsSet = new Set();
    photos.forEach((photo) => {
      (photo.comments || []).forEach((c) => {
        if (c.user_id) commenterIdsSet.add(String(c.user_id));
      });
    });
    const commenterIds = Array.from(commenterIdsSet);


    const commenters = await User.find(
      { _id: { $in: commenterIds } },
      "_id last_name"
    ).lean();

    const commentersMap = {};
    commenters.forEach((u) => {
      commentersMap[String(u._id)] = {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name,
      };
    });

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

    res.status(200).json(resultPhotos);
  } catch (err) {
    console.error("Error in /photosOfUser/:id:", err);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/new",upload.single("photo"),async(req,res)=>{
  if (!req.session.user_id) {
    return res.status(401).json({ message: "User is not logged in" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No image selected" });
  }
  try {
    const newPhoto = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),        
      user_id: req.session.user_id,
      comments: []                  
    });

    await newPhoto.save();
    
    res.status(200).json(newPhoto);

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:slug", async (request, response) => {
  try {
    const post = await Photo.findByIdAndDelete(request.params.slug);
  if (!post) {
    return response.status(404).send("Photo wasn't found");
  }
    response.status(204).send();
  } catch (error) {
    response.status(500).send({ error });
  }
});


module.exports = router;
