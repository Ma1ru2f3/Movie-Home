let isAdmin = false;
let favourites = [];

// Navigation
function showPage(pageId){
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  document.getElementById(pageId).style.display="block";
}

document.getElementById("homeBtn").onclick=()=>{showPage("homeDiv"); loadVideos();};
document.getElementById("searchBtn").onclick=()=>{showPage("searchDiv");};
document.getElementById("favBtn").onclick=()=>{showPage("favDiv"); loadFavourites();};
document.getElementById("profileBtn").onclick=()=>{showPage("profileDiv");};

// Login
document.getElementById("loginBtn").addEventListener("click", ()=>{
  const user=document.getElementById("user").value;
  const pass=document.getElementById("pass").value;
  if(user==="admin" && pass==="1234"){
    isAdmin=true;
    document.getElementById("loginDiv").style.display="none";
    document.getElementById("adminDiv").style.display="block";
  } else alert("Wrong credentials");
});

// Upload
document.getElementById("uploadBtn").addEventListener("click", ()=>{
  const file=document.getElementById("videoFile").files[0];
  const title=document.getElementById("videoTitle").value;
  if(!file) return alert("Choose a file");

  const formData=new FormData();
  formData.append("video",file);
  formData.append("title",title);
  formData.append("user","admin");
  formData.append("pass","1234");

  const xhr=new XMLHttpRequest();
  xhr.open("POST","/upload",true);

  document.getElementById("progressDiv").style.display="block";
  xhr.upload.onprogress=(e)=>{
    const percent=Math.round((e.loaded/e.total)*100);
    document.getElementById("progressBar").value=percent;
    document.getElementById("progressText").innerText=percent+"%";
  };

  xhr.onload=()=>{
    if(xhr.status===200){
      alert("Upload Success!");
      document.getElementById("progressDiv").style.display="none";
      loadVideos();
    } else alert("Upload failed");
  };
  xhr.send(formData);
});

// Load Videos
async function loadVideos(){
  const res=await fetch("/videos");
  const videos=await res.json();
  const list=document.getElementById("videoList");
  list.innerHTML="";
  videos.forEach(v=>{
    const div=document.createElement("div");
    div.innerHTML=`
      <h4>${v.title}</h4>
      <video width="320" controls src="${v.url}"></video>
      <button onclick="addFav('${v.public_id}','${v.url}','${v.title}')">❤ Fav</button>
      ${isAdmin?`<button onclick="deleteVideo('${v.public_id}')">Delete</button>`:""}
    `;
    list.appendChild(div);
  });
}

// Search
document.getElementById("searchGo").addEventListener("click", async ()=>{
  const term=document.getElementById("searchInput").value.toLowerCase();
  const res=await fetch("/videos");
  const videos=await res.json();
  const results=document.getElementById("searchResults");
  results.innerHTML="";
  videos.filter(v=>v.title.toLowerCase().includes(term))
        .forEach(v=>{
          const div=document.createElement("div");
          div.innerHTML=`<h4>${v.title}</h4><video width="320" controls src="${v.url}"></video>`;
          results.appendChild(div);
        });
});

// Favourites
function addFav(id,url,title){
  favourites.push({id,url,title});
  alert("Added to favourites!");
}
function loadFavourites(){
  const favList=document.getElementById("favList");
  favList.innerHTML="";
  favourites.forEach(v=>{
    const div=document.createElement("div");
    div.innerHTML=`<h4>${v.title}</h4><video width="320" controls src="${v.url}"></video>`;
    favList.appendChild(div);
  });
}

// Delete
async function deleteVideo(public_id){
  if(!confirm("Delete video?")) return;
  await fetch("/delete",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({public_id,user:"admin",pass:"1234"})
  });
  loadVideos();
}

window.onload=()=>{showPage("homeDiv"); loadVideos();};