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

// Create uploads folder if not exist
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

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
    if (!req.files || !req.files.video) return res.status(400).send("No file uploaded");
    const file = req.files.video;
    const { title } = req.body;
    const fileName = Date.now() + "_" + file.name;
    const savePath = path.join(UPLOAD_DIR, fileName);

    await file.mv(savePath);

    // Save metadata (title) in JSON file
    const metaPath = path.join(UPLOAD_DIR, "videos.json");
    let videos = [];
    if (fs.existsSync(metaPath)) videos = JSON.parse(fs.readFileSync(metaPath));
    videos.push({ fileName, title });
    fs.writeFileSync(metaPath, JSON.stringify(videos));

    res.json({ fileName, title });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete video
app.post("/delete", checkAdmin, (req, res) => {
  const { fileName } = req.body;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Remove from uploads
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  // Remove from metadata
  const metaPath = path.join(UPLOAD_DIR, "videos.json");
  if (fs.existsSync(metaPath)) {
    let videos = JSON.parse(fs.readFileSync(metaPath));
    videos = videos.filter(v => v.fileName !== fileName);
    fs.writeFileSync(metaPath, JSON.stringify(videos));
  }

  res.json({ deleted: true });
});

// Get all videos
app.get("/videos", (req, res) => {
  const metaPath = path.join(UPLOAD_DIR, "videos.json");
  let videos = [];
  if (fs.existsSync(metaPath)) videos = JSON.parse(fs.readFileSync(metaPath));
  videos = videos.map(v => ({ ...v, url: "/uploads/" + v.fileName }));
  res.json(videos);
});

// Serve uploads folder
app.use("/uploads", express.static(UPLOAD_DIR));

app.listen(3000, () => console.log("Server running on port 3000"));