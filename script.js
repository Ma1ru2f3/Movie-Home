let isAdmin=false;
let favourites=[];

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  document.getElementById(id).style.display="block";
}

document.getElementById("homeBtn").onclick=()=>{showPage("homeDiv"); loadVideos();};
document.getElementById("searchBtn").onclick=()=>{showPage("searchDiv");};
document.getElementById("favBtn").onclick=()=>{showPage("favDiv"); loadFavs();};
document.getElementById("profileBtn").onclick=()=>{showPage("profileDiv");};

document.getElementById("loginBtn").onclick=()=>{
  const u=document.getElementById("user").value;
  const p=document.getElementById("pass").value;
  if(u==="admin" && p==="1234"){isAdmin=true;
    document.getElementById("loginDiv").style.display="none";
    document.getElementById("adminDiv").style.display="block";
  } else alert("Wrong login");
};

document.getElementById("uploadBtn").onclick=()=>{
  const f=document.getElementById("videoFile").files[0];
  const t=document.getElementById("videoTitle").value;
  if(!f) return alert("Choose file");

  const fd=new FormData();
  fd.append("video",f);
  fd.append("title",t);
  fd.append("user","admin"); fd.append("pass","1234");

  const xhr=new XMLHttpRequest();
  xhr.open("POST","/upload");
  xhr.upload.onprogress=e=>{
    const pct=Math.round((e.loaded/e.total)*100);
    document.getElementById("progressDiv").style.display="block";
    document.getElementById("progressBar").value=pct;
    document.getElementById("progressText").innerText=pct+"%";
  };
  xhr.onload=()=>{
    if(xhr.status===200){
      alert("Success!");
      loadVideos();
    } else alert("Upload failed");
  };
  xhr.send(fd);
};

async function loadVideos(){
  const res=await fetch("/videos");
  const vids=await res.json();
  const list=document.getElementById("videoList");
  list.innerHTML="";
  vids.forEach(v=>{
    const d=document.createElement("div");
    d.innerHTML=`<h4>${v.title}</h4>
      <video width="300" controls src="${v.url}"></video>
      <button onclick="addFav('${v.public_id}','${v.url}','${v.title}')">❤</button>
      ${isAdmin?`<button onclick="deleteVid('${v.public_id}')">Delete</button>`:""}`;
    list.appendChild(d);
  });
}

document.getElementById("searchGo").onclick=async()=>{
  const term=document.getElementById("searchInput").value.toLowerCase();
  const res=await fetch("/videos");
  const vids=await res.json();
  const out=document.getElementById("searchResults");
  out.innerHTML="";
  vids.filter(v=>v.title.toLowerCase().includes(term))
      .forEach(v=>{
        out.innerHTML+=`<h4>${v.title}</h4><video width="300" controls src="${v.url}"></video>`;
      });
};

function addFav(id,url,title){
  favourites.push({id,url,title});
  alert("Added to favourites");
}
function loadFavs(){
  const out=document.getElementById("favList");
  out.innerHTML="";
  favourites.forEach(v=>{
    out.innerHTML+=`<h4>${v.title}</h4><video width="300" controls src="${v.url}"></video>`;
  });
}

async function deleteVid(id){
  await fetch("/delete",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({public_id:id,user:"admin",pass:"1234"})
  });
  loadVideos();
}

window.onload=()=>{showPage("homeDiv"); loadVideos();};