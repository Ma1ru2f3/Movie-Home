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

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
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
    res.status(401).send("Unauthorized");
  }
};

// Upload video route
app.post("/upload", checkAdmin, async (req, res) => {
  try {
    const file = req.files.video;
    const { title } = req.body;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video",
      folder: "Moviebox",
      use_filename: true,
      unique_filename: false
    });
    // Send back info including title
    res.json({ public_id: result.public_id, url: result.secure_url, title });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete video route
app.post("/delete", checkAdmin, async (req, res) => {
  try {
    const { public_id } = req.body;
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Fetch videos from Cloudinary folder
app.get("/videos", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "video",
      prefix: "Moviebox"
    });
    // Include title as public_id name (simple way)
    const videos = result.resources.map(v => ({
      public_id: v.public_id,
      url: v.secure_url,
      title: v.public_id.split("/").pop() // You can replace with saved title from DB later
    }));
    res.json(videos);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));