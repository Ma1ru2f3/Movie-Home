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
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "dlxa4684c",
  api_key: process.env.API_KEY || "488983136699335",
  api_secret: process.env.API_SECRET || "Q0pMZ3qtVHouepBUcWzPaDpZ7lI"
});

// Admin credentials
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

// Admin login middleware
const checkAdmin = (req, res, next) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    next();
  } else {
    res.status(401).send("Unauthorized: Invalid credentials");
  }
};

// Upload video
app.post("/upload", checkAdmin, async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).send("No video file uploaded");
    }
    const file = req.files.video;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video",
      folder: "Moviebox",
      use_filename: true,
      unique_filename: false
    });
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete video
app.post("/delete", checkAdmin, async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).send("public_id is required");
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));