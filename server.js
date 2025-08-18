const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());

// Ensure uploads folder exists
const uploadFolder = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

// In-memory video list (will reset on server restart)
let videos = [];

// Admin credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Admin middleware
const checkAdmin = (req, res, next) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) next();
  else res.status(401).send("Unauthorized");
};

// Upload route
app.post("/upload", checkAdmin, (req, res) => {
  if (!req.files || !req.files.video) return res.status(400).send("No file uploaded");
  const file = req.files.video;
  const title = req.body.title || file.name;
  const uploadPath = path.join(uploadFolder, file.name);

  file.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);
    const videoData = {
      title,
      url: `/uploads/${file.name}`
    };
    videos.push(videoData);
    res.json(videoData);
  });
});

// Get all videos
app.get("/videos", (req, res) => {
  res.json(videos);
});

// Delete video
app.post("/delete", checkAdmin, (req, res) => {
  const { title } = req.body;
  const videoIndex = videos.findIndex(v => v.title === title);
  if (videoIndex === -1) return res.status(404).send("Video not found");

  const filePath = path.join(uploadFolder, path.basename(videos[videoIndex].url));
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).send(err);
    videos.splice(videoIndex, 1);
    res.json({ message: "Deleted successfully" });
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));