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

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function openSmartLink(appLink, webLink) {
    if (!isMobile || !appLink) {
      window.open(webLink, "_blank", "noopener,noreferrer");
      return;
    }

    const start = Date.now();
    window.location.href = appLink;

    setTimeout(function () {
      if (Date.now() - start < 1800) {
        window.location.href = webLink;
      }
    }, 1200);
  }

  triggers.forEach(function(trigger) {

    trigger.addEventListener("click", function () {

      popupTitle.textContent = trigger.dataset.title;

      popupCover.src = trigger.dataset.cover;
      popupCover.alt = trigger.dataset.title + " cover";

      popupSpotify.href = trigger.dataset.spotify;
      popupApple.href = trigger.dataset.apple;
      popupYTMusic.href = trigger.dataset.ytmusic;
      popupYouTube.href = trigger.dataset.youtube;

      popupSpotify.onclick = function(e) {
        e.preventDefault();
        openSmartLink(trigger.dataset.spotifyApp, trigger.dataset.spotify);
      };

      popupApple.onclick = function(e) {
        e.preventDefault();
        openSmartLink(trigger.dataset.appleApp, trigger.dataset.apple);
      };

      popupYTMusic.onclick = function(e) {
        e.preventDefault();
        openSmartLink(trigger.dataset.ytmusicApp, trigger.dataset.ytmusic);
      };

      popupYouTube.onclick = function(e) {
        e.preventDefault();
        openSmartLink(trigger.dataset.youtubeApp, trigger.dataset.youtube);
      };

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
const heroCarousel = document.getElementById("heroCarousel");

if (heroCarousel) {

  setTimeout(function () {

    heroCarousel.classList.add("visible");

  }, 3000);

}

/* PAGE TRANSITIONS */

document.addEventListener("DOMContentLoaded", function () {
  const internalLinks = document.querySelectorAll("a[href]");

  internalLinks.forEach(function(link) {
    const href = link.getAttribute("href");

    if (
      href &&
      !href.startsWith("#") &&
      !href.startsWith("http") &&
      !link.hasAttribute("target")
    ) {
      link.addEventListener("click", function(event) {
        event.preventDefault();

        document.body.classList.add("page-fade-out");

        setTimeout(function() {
          window.location.href = href;
        }, 420);
      });
    }
  });
});
