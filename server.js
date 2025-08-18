const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());

// Cloudinary Config (Direct API Key)
cloudinary.config({
  cloud_name: "dlxa4684c",
  api_key: "614488499354894",
  api_secret: "v5qLsHvcETVr5ptyLl3N9zuHd_A"
});

// Admin credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Middleware: Admin check
const checkAdmin = (req, res, next) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) next();
  else res.status(401).send("Unauthorized");
};

// Upload route
app.post("/upload", checkAdmin, async (req, res) => {
  try {
    if (!req.files || !req.files.video) return res.status(400).send("No file uploaded");
    const file = req.files.video;
    const { title } = req.body;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video",
      folder: "Moviebox",
      use_filename: true,
      unique_filename: false
    });

    // Save to videos.json
    let videos = [];
    if (fs.existsSync("videos.json")) {
      videos = JSON.parse(fs.readFileSync("videos.json"));
    }
    videos.push({ title: title || result.public_id, url: result.secure_url, public_id: result.public_id });
    fs.writeFileSync("videos.json", JSON.stringify(videos, null, 2));

    res.json({ success: true, video: { title: title || result.public_id, url: result.secure_url, public_id: result.public_id } });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete route
app.post("/delete", checkAdmin, async (req, res) => {
  try {
    const { public_id } = req.body;
    await cloudinary.uploader.destroy(public_id, { resource_type: "video" });

    let videos = [];
    if (fs.existsSync("videos.json")) {
      videos = JSON.parse(fs.readFileSync("videos.json"));
      videos = videos.filter(v => v.public_id !== public_id);
      fs.writeFileSync("videos.json", JSON.stringify(videos, null, 2));
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Fetch all videos
app.get("/videos", (req, res) => {
  let videos = [];
  if (fs.existsSync("videos.json")) {
    videos = JSON.parse(fs.readFileSync("videos.json"));
  }
  res.json(videos);
});

app.listen(3000, () => console.log("Server running on port 3000"));