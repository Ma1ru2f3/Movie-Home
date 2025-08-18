
const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static("public"));

const VIDEO_DIR = path.join(__dirname, "public/videos");

// Ensure videos folder exists
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

// Admin credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Admin login middleware
const checkAdmin = (req, res, next) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) next();
  else res.status(401).send("Unauthorized");
};

// Upload video
app.post("/upload", checkAdmin, async (req, res) => {
  try {
    const file = req.files.video;
    const title = req.body.title || file.name;
    const savePath = path.join(VIDEO_DIR, file.name);
    await file.mv(savePath);
    res.json({ success: true, filename: file.name, title });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete video
app.post("/delete", checkAdmin, (req, res) => {
  const { filename } = req.body;
  const filePath = path.join(VIDEO_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).send("File not found");
  }
});

// Get list of videos
app.get("/videos", (req, res) => {
  const files = fs.readdirSync(VIDEO_DIR);
  const videos = files.map(f => ({
    filename: f,
    url: `/videos/${f}`,
    title: f
  }));
  res.json(videos);
});

app.listen(3000, () => console.log("Server running on port 3000"));