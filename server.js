const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const app = express();
app.use(fileUpload());
app.use(express.json());
app.use(express.static("public"));

cloudinary.config({
  cloud_name: "dlxa4684c",
  api_key: "614488499354894",
  api_secret: "v5qLsHvcETVr5ptyLl3N9zuHd_A"
});

// JSON file to store videos
const DATA_FILE = "videos.json";
let videos = [];
if (fs.existsSync(DATA_FILE)) {
  videos = JSON.parse(fs.readFileSync(DATA_FILE));
}

// Upload route
app.post("/upload", async (req, res) => {
  try {
    const file = req.files.video;
    const title = req.body.title || "Untitled";

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video",
      folder: "Moviebox"
    });

    const videoData = {
      public_id: result.public_id,
      url: result.secure_url,
      title
    };

    videos.push(videoData);
    fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2));

    res.json({ success: true, video: videoData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all videos (Home page)
app.get("/videos", (req, res) => {
  res.json(videos);
});

app.listen(3000, () => console.log("Server running on port 3000"));