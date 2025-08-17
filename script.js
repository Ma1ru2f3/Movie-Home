// Category Filter
const categoryBtns = document.querySelectorAll('.category-btn');
const movieCards = document.querySelectorAll('.movie-card');

categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('