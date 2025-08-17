// ভিডিও লিস্ট লোকাল স্টোরেজে রাখার জন্য
let videos = JSON.parse(localStorage.getItem('videos') || '[]');
let history = JSON.parse(localStorage.getItem('history') || '[]');

function renderVideos(list) {
    const container = document.getElementById('videoContainer');
    if (!container) return;
    container.innerHTML = '';
    list.forEach(v => {
        const embedURL = convertDriveLink(v.url);
        const videoEl = document.createElement('div');
        videoEl.className = 'video-item';
        videoEl.innerHTML = `
            <h3>${v.title}</h3>
            <iframe src="${embedURL}" width="320" height="240" frameborder="0" allowfullscreen></iframe>
        `;
        container.appendChild(videoEl);
    });
}

function convertDriveLink(url) {
    // Google Drive "share link" থেকে embed লিঙ্কে পরিবর্তন
    // উদাহরণ: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const match = url.match(/\/d\/(.*?)\//);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
}

function uploadVideo() {
    const title = document.getElementById('videoTitle').value;
    const url = document.getElementById('videoURL').value;
    if (!title || !url) {
        alert('সব ফিল্ড পূরণ করুন!');
        return;
    }
    videos.push({title, url});
    localStorage.setItem('videos', JSON.stringify(videos));
    alert('ভিডিও আপলোড হয়েছে!');
    document.getElementById('videoTitle').value = '';
    document.getElementById('videoURL').value = '';
}

function searchVideo() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    if (!query) return;
    history.push(query);
    localStorage.setItem('history', JSON.stringify(history));
    renderHistory();

    const filtered = videos.filter(v => v.title.toLowerCase().includes(query));
    renderVideos(filtered);
}

function renderHistory() {
    const listEl = document.getElementById('historyList');
    if (!listEl) return;
    listEl.innerHTML = '';
    history.slice(-10).reverse().forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        listEl.appendChild(li);
    });
}

// প্রাথমিক লোড
renderVideos(videos);
renderHistory();