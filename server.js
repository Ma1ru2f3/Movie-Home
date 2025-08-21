const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Environment variables
const GOOGLE_SHEET_ID = '1bWojlxKNd-A0R5lWzuplLEgYwDiK9NXzZMfkhwwzQig'; 
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

// API route for fetching data from Google Sheets
app.get('/api/data/:sheetName', async (req, res) => {
  const { sheetName } = req.params;
  try {
    const sheets = google.sheets({
      version: 'v4',
      auth: GOOGLE_SHEETS_API_KEY,
    });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    
    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.status(200).json({ success: true, data: [] });
    }

    const headers = rows[0].map(h => h.toLowerCase());
    const data = rows.slice(1).map(row => {
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = row[index] || '';
      });
      return rowObject;
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(`API Error for sheet ${sheetName}:`, error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// API route for login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const sheets = google.sheets({
      version: 'v4',
      auth: GOOGLE_SHEETS_API_KEY,
    });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'users!A:Z', 
    });
    
    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.status(404).json({ success: false, message: 'User data not found.' });
    }

    const headers = rows[0].map(h => h.toLowerCase());
    const users = rows.slice(1).map(row => {
      const user = {};
      headers.forEach((header, index) => {
        user[header] = row[index] || '';
      });
      return user;
    });
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      res.status(200).json({ success: true, message: 'Login successful!', user: { name: user.name, email: user.email, status: user.status } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// API route for uploading video data
app.post('/api/upload', async (req, res) => {
  const { 
    id, title, link, category, uploadedBy,
    uploadDate, season, episode, description, thumbnail
  } = req.body;
  
  if (!title || !link || !category) {
    return res.status(400).json({ success: false, message: 'Title, link, and category are required.' });
  }

  try {
    const sheets = google.sheets({
      version: 'v4',
      auth: GOOGLE_SHEETS_API_KEY,
    });

    const newRow = [
      id, title, link, category, uploadedBy,
      uploadDate, season, episode, description, thumbnail
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'videos!A:Z',
      valueInputOption: 'RAW',
      resource: {
        values: [newRow],
      },
    });

    res.status(200).json({ success: true, message: 'Video uploaded successfully!', data: response.data });

  } catch (error) {
    console.error('Upload API Error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Serve the index.html file for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
