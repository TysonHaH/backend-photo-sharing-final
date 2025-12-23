const express = require("express")
const app = express();
const cors = require("cors");
const session = require("express-session");
const multer = require('multer');
const path = require('path');
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const AdminRouter = require("./routes/AdminRouter");
const User = require("./db/userModel");
dbConnect();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 60 * 30 * 1000, 
},
}));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // directory
    cb(null, 'images'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use('/images', express.static(path.join(__dirname, 'images'))); 

app.use("/user", UserRouter);
app.use("/photosOfUser", PhotoRouter);
app.use("/commentsOfPhoto", CommentRouter);
app.use("/admin", AdminRouter);

app.get("/", (req, res) => {
  res.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
