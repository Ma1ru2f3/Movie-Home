// server.js
const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));
app.use(express.static(path.join(__dirname, "public")));

// ----------------- Cloudinary credentials (directly placed) -----------------
// WARNING: For production, move these to .env and never commit secrets.
cloudinary.config({
  cloud_name: "dlxa4684c",
  api_key: "614488499354894",
  api_secret: "v5qLsHvcETVr5ptyLl3N9zuHd_A"
});
// ---------------------------------------------------------------------------

// Admin credentials (change if you want)
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

const DATA_FILE = path.join(__dirname, "videos.json");

// helper: read/write JSON file
function readVideos(){
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch(e) {
    return [];
  }
}
function writeVideos(arr){
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
}

// middleware to check admin (expects form-data or json body with user & pass)
function checkAdmin(req, res, next){
  const user = req.body.user;
  const pass = req.body.pass;
  if(user === ADMIN_USER && pass === ADMIN_PASS) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

// Upload route (admin only)
app.post("/upload", checkAdmin, async (req, res) => {
  try {
    if(!req.files || !req.files.video) return res.status(400).json({ error: "No file" });
    const title = req.body.title || "Untitled";
    const file = req.files.video;

    // upload to Cloudinary as video
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video",
      folder: "Moviebox",
      use_filename: true,
      unique_filename: false
    });

    // save to videos.json
    const videos = readVideos();
    const entry = {
      public_id: result.public_id,
      url: result.secure_url,
      title: title,
      uploaded_at: new Date().toISOString()
    };
    videos.unshift(entry); // newest first
    writeVideos(videos);

    // respond with saved video
    return res.json({ success: true, video: entry });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Delete route (admin only) — removes from Cloudinary and videos.json
app.post("/delete", checkAdmin, async (req, res) => {
  try {
    const { public_id } = req.body;
    if(!public_id) return res.status(400).json({ error: "public_id required" });

    // delete from cloudinary
    await cloudinary.uploader.destroy(public_id, { resource_type: "video" });

    // remove from JSON
    let videos = readVideos();
    videos = videos.filter(v => v.public_id !== public_id);
    writeVideos(videos);

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Get all videos (used by frontend Home / Search)
app.get("/videos", (req, res) => {
  const videos = readVideos();
  res.json(videos);
});

// fallback to serve index
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));