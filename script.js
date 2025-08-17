let videos = JSON.parse(localStorage.getItem('videos') || '[]');
let history = JSON.parse(localStorage.getItem('history') || '[]');

function convertDriveLink(url) {
    const match = url.match(/\/d\/(.*?)\//);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
}

function renderVideos(list) {
    const container = document.getElementById('videoContainer');
    container.innerHTML = '';
    list.forEach(v => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <img src="https://via.placeholder.com/200x120.png?text=Video" alt="${v.title}">
            <h3>${v.title}</h3>
        `;
        card.onclick = () => openLightbox(convertDriveLink(v.url));
        container.appendChild(card);
    });
}

function openLightbox(url) {
    const lightbox = document.getElementById('lightbox');
    const iframe = document.getElementById('lightboxVideo');
    iframe.src = url;
    lightbox.style.display = 'flex';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const iframe = document.getElementById('lightboxVideo');
    iframe.src = '';
    lightbox.style.display = 'none';
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