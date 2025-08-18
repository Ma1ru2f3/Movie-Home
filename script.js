// public/script.js
let adminLogged = false;
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

const homeBtn = document.getElementById("homeBtn");
const searchBtn = document.getElementById("searchBtn");
const favBtn = document.getElementById("favBtn");
const profileBtn = document.getElementById("profileBtn");

const pages = {
  home: document.getElementById("homePage"),
  search: document.getElementById("searchPage"),
  fav: document.getElementById("favPage"),
  profile: document.getElementById("profilePage")
};

function showPage(name){
  Object.values(pages).forEach(p=>p.classList.remove("active"));
  pages[name].classList.add("active");
}
homeBtn.onclick = ()=>{ showPage("home"); loadVideos(); };
searchBtn.onclick = ()=>{ showPage("search"); };
favBtn.onclick = ()=>{ showPage("fav"); loadFavourites(); };
profileBtn.onclick = ()=>{ showPage("profile"); };

async function fetchVideosRaw(){
  try{
    const res = await fetch("/videos");
    if(!res.ok) throw new Error("Failed to fetch");
    const arr = await res.json();
    return arr;
  } catch(e){
    console.error(e);
    return [];
  }
}

// render video cards
function makeCard(video, isAdmin){
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <h4>${escapeHtml(video.title)}</h4>
    <video controls src="${video.url}"></video>
    <div class="row" style="margin-top:8px">
      <button class="small" onclick='addFav("${video.public_id}")'>❤ Favourite</button>
      ${isAdmin ? `<button class="ghost" onclick='deleteVideo("${video.public_id}")'>Delete</button>` : ""}
    </div>
  `;
  return div;
}

// Load videos into home
async function loadVideos(){
  const list = document.getElementById("videoGrid");
  list.innerHTML = "<p>Loading...</p>";
  const videos = await fetchVideosRaw();
  list.innerHTML = "";
  if(videos.length === 0) { list.innerHTML = "<p>No videos yet.</p>"; return; }
  videos.forEach(v => list.appendChild(makeCard(v, adminLogged)));
}

// Search
document.getElementById("searchGo").onclick = async ()=>{
  const q = (document.getElementById("searchInput").value || "").trim().toLowerCase();
  const out = document.getElementById("searchResults");
  out.innerHTML = "<p>Searching...</p>";
  const videos = await fetchVideosRaw();
  const found = videos.filter(v => v.title.toLowerCase().includes(q));
  out.innerHTML = "";
  if(found.length === 0) out.innerHTML = "<p>No results.</p>";
  found.forEach(v => out.appendChild(makeCard(v, adminLogged)));
};

// Favourites (stored in localStorage as array of public_id)
function getFavs(){
  try { return JSON.parse(localStorage.getItem("moviebox_favs") || "[]"); } catch(e){ return []; }
}
function saveFavs(arr){ localStorage.setItem("moviebox_favs", JSON.stringify(arr)); }

function addFav(public_id){
  const favs = getFavs();
  if(favs.includes(public_id)){ alert("Already in favourites"); return; }
  favs.push(public_id);
  saveFavs(favs);
  alert("Added to favourites");
}

async function loadFavourites(){
  const favIds = getFavs();
  const out = document.getElementById("favGrid");
  out.innerHTML = "<p>Loading...</p>";
  if(favIds.length === 0){ out.innerHTML = "<p>No favourites</p>"; return; }
  const videos = await fetchVideosRaw();
  const sel = videos.filter(v => favIds.includes(v.public_id));
  out.innerHTML = "";
  sel.forEach(v => out.appendChild(makeCard(v, adminLogged)));
}

// Admin login / upload / delete
document.getElementById("loginBtn").onclick = ()=>{
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;
  if(user === ADMIN_USER && pass === ADMIN_PASS){
    adminLogged = true;
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminBox").style.display = "block";
    alert("Admin logged in");
    loadVideos();
  } else alert("Invalid credentials");
};

document.getElementById("uploadBtn").onclick = ()=>{
  if(!adminLogged) return alert("Login as admin first");
  const fileEl = document.getElementById("videoFile");
  const title = document.getElementById("videoTitle").value.trim() || "Untitled";
  const file = fileEl.files[0];
  if(!file) return alert("Choose a video file");

  const fd = new FormData();
  fd.append("video", file);
  fd.append("title", title);
  fd.append("user", ADMIN_USER);
  fd.append("pass", ADMIN_PASS);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload", true);

  document.getElementById("progressWrap").style.display = "block";
  const bar = document.getElementById("progressBar");
  const pct = document.getElementById("progressPct");
  bar.value = 0; pct.innerText = "0%";

  xhr.upload.onprogress = (e) => {
    if(e.lengthComputable){
      const percent = Math.round((e.loaded / e.total) * 100);
      bar.value = percent;
      pct.innerText = percent + "%";
    }
  };
  xhr.onload = () => {
    if(xhr.status === 200){
      try {
        const res = JSON.parse(xhr.responseText);
        if(res.success){
          alert("Upload success");
          document.getElementById("videoFile").value = "";
          document.getElementById("videoTitle").value = "";
          // Immediately append new video in Home (without waiting)
          loadVideos();
        } else {
          alert("Upload failed");
        }
      } catch(e){
        alert("Upload response error");
      }
    } else {
      alert("Upload failed: " + xhr.status);
    }
    setTimeout(()=>{ document.getElementById("progressWrap").style.display = "none"; }, 800);
  };
  xhr.onerror = ()=>{ alert("Upload error"); document.getElementById("progressWrap").style.display = "none"; };
  xhr.send(fd);
};

// delete video (admin only)
async function deleteVideo(public_id){
  if(!adminLogged) return alert("Admin only");
  if(!confirm("Delete this video?")) return;
  const res = await fetch("/delete", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ public_id, user: ADMIN_USER, pass: ADMIN_PASS })
  });
  const data = await res.json();
  if(data && data.result === "ok" || data.success) {
    alert("Deleted");
  } else {
    // cloudinary destroy returns different shapes; we still reload list
    alert("Deleted (response from server)");
  }
  loadVideos();
}

// helper
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// initial
showPage("home");
loadVideos();