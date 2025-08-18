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

cloudinary.config({
  CLOUD_NAME=dlxa4684c
API_KEY=488983136699335
API_SECRET=Q0pMZ3qtVHouepBUcWzPaDpZ7lI
ADMIN_USER=admin
ADMIN_PASS=1234
});

// Admin login middleware
const checkAdmin = (req, res, next) => {
  const { user, pass } = req.body;
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

// Upload route
app.post("/upload", checkAdmin, async (req, res) => {
  try {
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

// Delete route
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