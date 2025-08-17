// Save history
function saveHistory(title) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  if (!history.includes(title)) {
    history.push(title);
    localStorage.setItem("history", JSON.stringify(history));
  }
}

// Show history
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("historyList")) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    let list = document.getElementById("historyList");
    if (history.length === 0) {
      list.innerHTML = "<p>No history yet.</p>";
    } else {
      history.forEach(item => {
        let li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
    }
  }
});

// Category filter
function filterCategory(category) {
  let allVideos = document.querySelectorAll(".video-card");
  allVideos.forEach(card => {
    if (category === "all" || card.dataset.category === category) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Copy videos from Home page to Categories
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("categoryGrid")) {
    let homeVideos = JSON.parse(localStorage.getItem("allVideos")) || [];
    let grid = document.getElementById("categoryGrid");

    if (homeVideos.length === 0) {
      // প্রথমবারে index.html থেকে সব ভিডিও পড়া
      let cards = document.querySelectorAll("#videoGrid .video-card");
      let htmlArr = [];
      cards.forEach(c => htmlArr.push(c.outerHTML));
      localStorage.setItem("allVideos", JSON.stringify(htmlArr));
      homeVideos = htmlArr;
    }

    homeVideos.forEach(v => {
      grid.innerHTML += v;
    });
  }
});