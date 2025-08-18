const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());

// Admin credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Admin login middleware
const checkAdmin = (req, res, next) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) next();
  else res.status(401).json({ success: false, message: "Unauthorized" });
};

// Upload route
app.post("/upload", checkAdmin, async (req, res) => {
  if (!req.files || !req.files.video) return res.status(400).send("No file uploaded");
  const file = req.files.video;
  const title = req.body.title || file.name;
  const savePath = path.join(UPLOAD_DIR, file.name);

  file.mv(savePath, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true, url: "/uploads/" + file.name, title });
  });
});

// Delete route
app.post("/delete", checkAdmin, (req, res) => {
  const { filename } = req.body;
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else res.status(404).json({ success: false, message: "File not found" });
});

// Fetch videos
app.get("/videos", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  const videos = files.map(f => ({ title: f, url: "/uploads/" + f }));
  res.json(videos);
});

app.listen(3000, () => console.log("Server running on port 3000"));