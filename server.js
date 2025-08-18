const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Create videos folder if not exists
const videoDir = path.join(__dirname, "public", "videos");
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videoDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "_" + file.originalname;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("video"), (req, res) => {
  const { user, pass, title } = req.body;
  if (user !== "admin" || pass !== "1234") return res.status(401).send("Unauthorized");

  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  res.send({ message: "Upload success", filename: file.filename, url: "/videos/" + file.filename, title });
});

// Get all videos
app.get("/videos", (req, res) => {
  fs.readdir(videoDir, (err, files) => {
    if (err) return res.status(500).send("Error reading videos");

    const videoData = files.map(f => {
      const title = f.split("_").slice(1).join("_"); // original name
      return { public_id: f, title, url: "/videos/" + f };
    });

    res.json(videoData);
  });
});

// Delete video
app.post("/delete", (req, res) => {
  const { user, pass, public_id } = req.body;
  if (user !== "admin" || pass !== "1234") return res.status(401).send("Unauthorized");

  const filePath = path.join(videoDir, public_id);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.send({ message: "Deleted" });
  }
  res.status(404).send("File not found");
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));