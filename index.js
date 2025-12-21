const express = require("express")
const app = express();
const cors = require("cors");
const session = require("express-session");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const AdminRouter = require("./routes/AdminRouter");
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

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
