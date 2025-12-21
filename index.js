const express = require("express")
const app = express();
const cors = require("cors");
const session = require("express-session");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const AdminRouter = require("./routes/AdminRouter");
const User = require("./db/userModel");
dbConnect();

app.use(cors({
  origin: "http://localhost:3000",
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

app.use("/user", UserRouter);
app.use("/photosOfUser", PhotoRouter);
app.use("/commentsOfPhoto", CommentRouter);
app.use("/admin", AdminRouter);

app.get("/", (req, res) => {
  res.send({ message: "Hello from photo-sharing app API!" });
});

app.post("/register", async (req, res) => {
  const {
    last_name,
    location,
    description,
    occupation,
    username,
    password,
  } = req.body;
  if (!username || !password  || !last_name) {
    return res.status(400).send({ message: "Missing required fields" });
  }
  try {
    const isExist = await User.findOne({ username });
    if (isExist) {
      return res.status(400).send({ message: "User already exists" });
    }
    const user = new User({
      username,
      password,
      last_name,
      location,
      description,
      occupation
    });
    await user.save();
    res.status(200).send({message: "Success!"});
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});
app.listen(8081, () => {
  console.log("server listening on port 8081");
});
