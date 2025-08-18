let isAdmin = false;

const loginBtn = document.getElementById("loginBtn");
const uploadBtn = document.getElementById("uploadBtn");
const videoList = document.getElementById("videoList");
const progressDiv = document.getElementById("progressDiv");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

loginBtn.addEventListener("click", async () => {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  // Simple check, show admin panel if correct
  if(user === "admin" && pass === "1234"){
    isAdmin = true;
    document.getElementById("loginDiv").style.display="none";
    document.getElementById("adminDiv").style.display="block";
  } else alert("Wrong credentials");
});

uploadBtn.addEventListener("click", async () => {
  const file = document.getElementById("videoFile").files[0];
  const title = document.getElementById("videoTitle").value;
  if(!file) return alert("Select video");

  const formData = new FormData();
  formData.append("video", file);
  formData.append("title", title);
  formData.append("user","admin");
  formData.append("pass","1234");

  progressDiv.style.display="block";

  const xhr = new XMLHttpRequest();
  xhr.open("POST","/upload",true);

  xhr.upload.onprogress = (e)=>{
    const percent = Math.round((e.loaded / e.total) * 100);
    progressBar.value = percent;
    progressText.innerText = percent + "%";
  }

  xhr.onload = async ()=>{
    if(xhr.status===200){
      alert("Upload Success!");
      progressDiv.style.display="none";
      loadVideos(); // Refresh videos list
    } else alert("Upload failed");
  }

  xhr.send(formData);
});

async function loadVideos(){
  const res = await fetch("/videos");
  const videos = await res.json();
  videoList.innerHTML = "";
  videos.forEach(v=>{
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>${v.title}</h4>
      <video width="320" controls src="${v.url}"></video>
      ${isAdmin ? `<button onclick="deleteVideo('${v.public_id}')">Delete</button>` : ""}
    `;
    videoList.appendChild(div);
  });
}

async function deleteVideo(public_id){
  if(!confirm("Delete video?")) return;
  const res = await fetch("/delete",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({public_id, user:"admin", pass:"1234"})
  });
  const data = await res.json();
  alert("Deleted");
  loadVideos();
}

window.onload = loadVideos;