const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Internal storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/videos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Admin credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Simple Admin middleware
const checkAdmin = (req, res, next) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

// Upload route
app.post("/upload", checkAdmin, upload.single("video"), (req, res) => {
  const { title } = req.body;
  if (!req.file) return res.status(400).send("No file uploaded");

  const videoData = {
    title: title || req.file.originalname,
    filename: req.file.filename,
    url: `/videos/${req.file.filename}`
  };

  // Save video info in JSON
  const dbPath = "./public/videos/videos.json";
  let videos = [];
  if (fs.existsSync(dbPath)) {
    videos = JSON.parse(fs.readFileSync(dbPath));
  }
  videos.push(videoData);
  fs.writeFileSync(dbPath, JSON.stringify(videos, null, 2));

  res.json({ success: true, video: videoData });
});

// Delete video route
app.post("/delete", checkAdmin, (req, res) => {
  const { filename } = req.body;
  const dbPath = "./public/videos/videos.json";
  if (!fs.existsSync(dbPath)) return res.status(400).send("No videos found");

  let videos = JSON.parse(fs.readFileSync(dbPath));
  const videoIndex = videos.findIndex(v => v.filename === filename);
  if (videoIndex === -1) return res.status(404).send("Video not found");

  const filePath = path.join(__dirname, "public/videos", filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  videos.splice(videoIndex, 1);
  fs.writeFileSync(dbPath, JSON.stringify(videos, null, 2));
  res.json({ success: true });
});

// Fetch videos for home page
app.get("/videos", (req, res) => {
  const dbPath = "./public/videos/videos.json";
  let videos = [];
  if (fs.existsSync(dbPath)) {
    videos = JSON.parse(fs.readFileSync(dbPath));
  }
  res.json(videos);
});

app.listen(3000, () => console.log("Server running on port 3000"));