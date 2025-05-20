// Инициализация мобильного меню
document.addEventListener("DOMContentLoaded", function () {
  // Переключение мобильного меню
  document.getElementById("mobile-menu").addEventListener("click", function () {
    document.getElementById("nav-links").classList.toggle("active");
  });

  // Подсветка активной страницы
  const currentPage = location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".nav-links a");

  links.forEach((link) => {
    const linkPage = link.getAttribute("href");
    if (currentPage === linkPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
