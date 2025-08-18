let isAdmin = false;

// Fetch videos
async function loadVideos() {
  const res = await fetch("/videos");
  const videos = await res.json();
  const videoList = document.getElementById("videoList");
  videoList.innerHTML = "";
  videos.forEach(v => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>${v.title}</h4>
      <video width="320" controls>
        <source src="${v.url}" type="video/mp4">
      </video>
      ${isAdmin ? `<button onclick="deleteVideo('${v.public_id}')">Delete</button>` : ""}
      <hr>
    `;
    videoList.appendChild(div);
  });
}

// Delete video
async function deleteVideo(public_id) {
  const form = new FormData();
  form.append("user", prompt("Admin Username"));
  form.append("pass", prompt("Admin Password"));
  form.append("public_id", public_id);
  const res = await fetch("/delete", { method: "POST", body: form });
  if (res.ok) loadVideos();
}

// Admin Upload
document.getElementById("uploadBtn").onclick = async () => {
  const file = document.getElementById("videoFile").files[0];
  const title = document.getElementById("videoTitle").value;
  if (!file) return alert("Select a video");

  const formData = new FormData();
  formData.append("video", file);
  formData.append("title", title);
  formData.append("user", prompt("Admin Username"));
  formData.append("pass", prompt("Admin Password"));

  const progressBarContainer = document.getElementById("progressBarContainer");
  const progressBar = document.getElementById("progressBar");
  progressBarContainer.style.display = "block";
  progressBar.style.width = "0%";

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload");
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total) * 100;
      progressBar.style.width = percent + "%";
    }
  };
  xhr.onload = () => {
    if (xhr.status === 200) {
      progressBar.style.width = "100%";
      alert("Uploaded Successfully");
      loadVideos();
    } else {
      alert("Upload failed");
    }
  };
  xhr.send(formData);
};

// Initial load
loadVideos();