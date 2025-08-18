// server.js
const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());

// Cloudinary config
cloudinary.config({
  cloud_name: "dlxa4684c",
  api_key: "614488499354894",
  api_secret: "v5qLsHvcETVr5ptyLl3N9zuHd_A"
});

// Admin credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Admin login middleware
const checkAdmin = (req, res, next) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

// Upload route
app.post("/upload", checkAdmin, async (req, res) => {
  if (!req.files || !req.files.video) return res.status(400).send("No file uploaded");

  const file = req.files.video;
  const { title } = req.body;

  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video",
      folder: "Moviebox",
      use_filename: true,
      unique_filename: false
    });
    // Send video info back
    res.json({ public_id: result.public_id, url: result.secure_url, title });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Fetch all videos
app.get("/videos", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "video",
      prefix: "Moviebox"
    });

    const videos = result.resources.map(v => ({
      public_id: v.public_id,
      url: v.secure_url,
      title: v.public_id.split("/").pop() // এখন filename কে title ধরছি
    }));

    res.json(videos);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete video
app.post("/delete", checkAdmin, async (req, res) => {
  try {
    const { public_id } = req.body;
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));