document.addEventListener("DOMContentLoaded", function () {

  const popup = document.getElementById("listenPopup");
  const closeBtn = document.getElementById("closeListenPopup");

  const popupTitle = document.getElementById("popupTitle");
  const popupCover = document.getElementById("popupCover");

  const popupSpotify = document.getElementById("popupSpotify");
  const popupApple = document.getElementById("popupApple");
  const popupYTMusic = document.getElementById("popupYTMusic");
  const popupYouTube = document.getElementById("popupYouTube");

  const triggers = document.querySelectorAll(".music-popup-trigger");

  triggers.forEach(function(trigger) {

    trigger.addEventListener("click", function () {

      popupTitle.textContent = trigger.dataset.title;

      popupCover.src = trigger.dataset.cover;
      popupCover.alt = trigger.dataset.title + " cover";

      popupSpotify.href = trigger.dataset.spotify;
      popupApple.href = trigger.dataset.apple;
      popupYTMusic.href = trigger.dataset.ytmusic;
      popupYouTube.href = trigger.dataset.youtube;

      popup.classList.add("active");

    });

  });

  if (closeBtn) {
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
