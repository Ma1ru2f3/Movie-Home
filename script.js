const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const movieList = document.getElementById("movieList");
const historyList = document.getElementById("historyList");

// Load history from localStorage
let history = JSON.parse(localStorage.getItem("movieHistory")) || [];
updateHistoryUI();

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) return;

  // Save to history
  history.push(query);
  localStorage.setItem("movieHistory", JSON.stringify(history));
  updateHistoryUI();

  // Fake search result (replace with API later)
  movieList.innerHTML = `<li>Result for "${query}"</li>`;
});

function updateHistoryUI() {
  historyList.innerHTML = "";
  history.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}