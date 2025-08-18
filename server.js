const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Data storage
const videosFile = path.join(__dirname, 'videos.json');
if (!fs.existsSync(videosFile)) fs.writeFileSync(videosFile, JSON.stringify([]));

app.use(bodyParser.json());
app.use(express.static(__dirname));

// API: Get all videos
app.get('/api/videos', (req, res) => {
    const videos = JSON.parse(fs.readFileSync(videosFile));
    res.json(videos);
});

// API: Admin upload video
app.post('/api/videos', async (req, res) => {
    const { title, link, category, adminKey } = req.body;
    if(adminKey !== "123450") return res.status(403).json({error: "Unauthorized"});
    if(!title || !link) return res.status(400).json({error: "Title and Link required"});

    // Download video
    const response = await fetch(link);
    if(!response.ok) return res.status(400).json({error: "Invalid video link"});
    
    const videoName = `${Date.now()}.mp4`;
    const fileStream = fs.createWriteStream(path.join(__dirname, 'videos', videoName));
    response.body.pipe(fileStream);
    response.body.on('error', (err) => { console.error(err); });

    fileStream.on('finish', () => {
        const videos = JSON.parse(fs.readFileSync(videosFile));
        const newVideo = { id: Date.now(), title, link: '/videos/' + videoName, category };
        videos.push(newVideo);
        fs.writeFileSync(videosFile, JSON.stringify(videos, null, 2));
        res.json({success: true, video: newVideo});
    });
});

// Create videos folder if not exists
const videosDir = path.join(__dirname, 'videos');
if(!fs.existsSync(videosDir)) fs.mkdirSync(videosDir);

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));