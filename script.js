const SHEETDB_API = "https://sheetdb.io/api/v1/3p5l2ilgzemvr"; // Your SheetBD API
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

let isAdmin = false;

// Show sections
function showSection(section) {
  document.getElementById('homeSection').style.display = (section==='home') ? 'block' : 'none';
}

// Show admin login/panel
function showAdmin() {
  if(isAdmin){
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
  } else {
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
  }
}

// Admin login
function loginAdmin(){
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;
  if(user === ADMIN_USER && pass === ADMIN_PASS){
    isAdmin = true;
    showAdmin();
    alert("Admin logged in!");
    fetchVideos();
  } else {
    alert("Invalid credentials");
  }
}

// Fetch videos from SheetBD
async function fetchVideos(){
  const res = await fetch(SHEETDB_API);
  const data = await res.json();
  displayVideos(data);
}

// Display videos
function displayVideos(videos){
  const home = document.getElementById('homeSection');
  home.innerHTML = '';
  videos.forEach(v => {
    const div = document.createElement('div');
    div.className = 'video-container';
    
    if(v.link.includes("youtube") || v.link.includes("vimeo") || v.link.includes("moviebox")){
      div.innerHTML = `<iframe src="${convertToEmbed(v.link)}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      div.innerHTML = `<video controls><source src="${v.link}" type="video/mp4"></video>`;
    }

    if(isAdmin){
      const delBtn = document.createElement('button');
      delBtn.innerText = "Delete";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => deleteVideo(v.id);
      div.appendChild(delBtn);
    }

    home.appendChild(div);
  });
}

// Convert common video links to embed link (simplified)
function convertToEmbed(url){
  if(url.includes("youtube.com")){
    const id = url.split("v=")[1];
    return `https://www.youtube.com/embed/${id}`;
  }
  if(url.includes("youtu.be")){
    const id = url.split("/").pop();
    return `https://www.youtube.com/embed/${id}`;
  }
  // For others, return same
  return url;
}

// Add video
async function addVideo(){
  const link = document.getElementById('videoURL').value;
  const title = document.getElementById('videoTitle').value;
  const category = document.getElementById('videoCategory').value;

  if(!link || !title){ alert("Enter link and title"); return; }

  await fetch(SHEETBD_API, {
    method:"POST",
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({data:{link, title, category}})
  });
  fetchVideos();
  document.getElementById('videoURL').value = '';
  document.getElementById('videoTitle').value = '';
  document.getElementById('videoCategory').value = '';
}

// Delete video
async function deleteVideo(id){
  if(!confirm("Delete this video?")) return;
  await fetch(`${SHEETBD_API}/${id}`, {method:'DELETE'});
  fetchVideos();
}

// Initial load
showSection('home');
fetchVideos();