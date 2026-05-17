document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("openListenPopup");
  const closeBtn = document.getElementById("closeListenPopup");
  const popup = document.getElementById("listenPopup");

  if (openBtn && popup) {
    openBtn.addEventListener("click", function () {
      popup.classList.add("active");
    });
  }

  if (closeBtn && popup) {
    closeBtn.addEventListener("click", function () {
      popup.classList.remove("active");
    });
  }

  if (popup) {
    popup.addEventListener("click", function (event) {
      if (event.target === popup) {
        popup.classList.remove("active");
      }
    });
  }
});
