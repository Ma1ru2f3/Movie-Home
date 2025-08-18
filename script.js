let adminLoggedIn = false;

function showHome() {
  fetch("/videos").then(r=>r.json()).then(videos=>{
    const home = document.getElementById("home");
    home.innerHTML = "<h2>Home</h2>" + videos.map(v=>`
      <div>
        <h3>${v.title}</h3>
        <video width="320" controls src="${v.url}"></video>
      </div>
    `).join("");
  });
}

function showSearch() { document.getElementById("search").innerHTML="<h2>Search</h2>"; }
function showFav() { document.getElementById("fav").innerHTML="<h2>Fvrt</h2>"; }

function showProfile() {
  const profile = document.getElementById("profile");
  if (!adminLoggedIn) {
    profile.innerHTML = `
      <h2>Admin Login</h2>
      <input id="user" placeholder="User"/>
      <input id="pass" placeholder="Pass" type="password"/>
      <button onclick="loginAdmin()">Login</button>
    `;
  } else {
    profile.innerHTML = `
      <h2>Admin Panel</h2>
      <input type="text" id="title" placeholder="Video Title"/>
      <input type="file" id="videoFile"/>
      <button onclick="uploadVideo()">Upload</button>
      <div id="progress"></div>
      <div id="videos"></div>
    `;
    loadAdminVideos();
  }
}

function loginAdmin(){
  const user=document.getElementById("user").value;
  const pass=document.getElementById("pass").value;
  fetch("/upload",{method:"POST", body: JSON.stringify({user, pass}), headers:{"Content-Type":"application/json"}})
  .then(r=>{
    if(r.status===401) alert("Unauthorized");
    else { adminLoggedIn=true; showProfile(); }
  });
}

function uploadVideo(){
  const file = document.getElementById("videoFile").files[0];
  const title = document.getElementById("title").value;
  if(!file) return alert("Select file");

  const formData = new FormData();
  formData.append("video", file);
  formData.append("user", "admin");
  formData.append("pass", "1234");
  formData.append("title", title);

  const xhr = new XMLHttpRequest();
  xhr.open("POST","/upload");
  xhr.upload.onprogress = function(e){
    const percent = Math.round(e.loaded / e.total * 100);
    document.getElementById("progress").innerText = `Uploading... ${percent}%`;
  }
  xhr.onload = function(){
    document.getElementById("progress").innerText = "Upload Success";
    loadAdminVideos();
    showHome();
  }
  xhr.send(formData);
}

function loadAdminVideos(){
  fetch("/videos").then(r=>r.json()).then(videos=>{
    const div = document.getElementById("videos");
    div.innerHTML = videos.map(v=>`
      <div>
        <h3>${v.title}</h3>
        <video width="320" controls src="${v.url}"></video>
        <button onclick="deleteVideo('${v.title}')">Delete</button>
      </div>
    `).join("");
  });
}

function deleteVideo(filename){
  fetch("/delete", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({filename, user:"admin", pass:"1234"})
  }).then(r=>r.json()).then(res=>{
    if(res.success){ loadAdminVideos(); showHome(); }
  });
}

// Initially show home
showHome();