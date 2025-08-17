// Dynamic search in Home / Categories
const searchBox = document.getElementById('searchBox');
const movieSection = document.getElementById('movieSection');

if (searchBox && movieSection) {
  const movieCards = movieSection.getElementsByClassName('movie-card');

  searchBox.addEventListener('keyup', function() {
    const filter = searchBox.value.toLowerCase();
    for (let i = 0; i < movieCards.length; i++) {
      const title = movieCards[i].getElementsByTagName('h3')[0].innerText.toLowerCase();
      if (title.includes(filter)) {
        movieCards[i].style.display = "";
      } else {
        movieCards[i].style.display = "none";
      }
    }
  });
}

// LocalStorage for Recently Watched
function addRecentlyWatched(title) {
  let history = JSON.parse(localStorage.getItem('recentlyWatched')) || [];
  if (!history.includes(title)) {
    history.unshift(title);
    if (history.length > 20) history.pop();
    localStorage.setItem('recentlyWatched', JSON.stringify(history));
  }
}