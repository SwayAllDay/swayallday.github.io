document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("zoyaSignupForm");
  if (!form) return;

  const stepSignup = document.getElementById("zoyaSignupStep");
  const stepDownload = document.getElementById("zoyaDownloadStep");
  const errorMessage = document.getElementById("zoyaErrorMessage");

  const audioPlayer = document.getElementById("zoyaAudioPlayer");
  const playPauseBtn = document.getElementById("zoyaPlayPauseBtn");
  const progressWrap = document.querySelector(".zoya-progress-wrap");
  const progressBar = document.getElementById("zoyaProgressBar");
  const currentTimeEl = document.getElementById("zoyaCurrentTime");
  const durationEl = document.getElementById("zoyaDuration");
  const spotifyRevealBtn = document.getElementById("zoyaSpotifyRevealBtn");

  const GOOGLE_SCRIPT_URL =
    "https://zoya-newsletter-signup.delicate-pine-c41c.workers.dev/";

  let hasTrackedPlay = false;

  function getUTM(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || "";
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    errorMessage.classList.add("hidden");

   const payload = {
  name: document.getElementById("zoyaName").value.trim(),
  email: document.getElementById("zoyaEmail").value.trim(),
  source: "Website",

  utm_source: getUTM("utm_source") || "website",
  utm_medium: getUTM("utm_medium") || "homepage",
  utm_campaign: getUTM("utm_campaign") || "organic_traffic",
  utm_adset: getUTM("utm_adset") || "organic_followers",
  utm_content: getUTM("utm_content") || "fan"
};

    if (typeof fbq === "function") {
      fbq("track", "Lead");
    }

    stepSignup.classList.add("hidden");
    stepDownload.classList.remove("hidden");

    if (audioPlayer) {
      audioPlayer.load();
    }

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch(function (error) {
      console.error("Google Sheets save failed:", error);
    });
  });

  playPauseBtn.addEventListener("click", function () {
    if (audioPlayer.paused) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
  });

  audioPlayer.addEventListener("play", function () {
    playPauseBtn.textContent = "❚❚";

    if (!hasTrackedPlay && typeof fbq === "function") {
      fbq("trackCustom", "PreviewPlay");
      hasTrackedPlay = true;
    }
  });

  audioPlayer.addEventListener("pause", function () {
    playPauseBtn.textContent = "▶";
  });

  audioPlayer.addEventListener("loadedmetadata", function () {
    durationEl.textContent = formatTime(audioPlayer.duration);
  });

  audioPlayer.addEventListener("timeupdate", function () {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progress || 0}%`;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
  });

  progressWrap.addEventListener("click", function (e) {
    const rect = progressWrap.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;

    audioPlayer.currentTime = percentage * audioPlayer.duration;
  });

  audioPlayer.addEventListener("ended", function () {
    playPauseBtn.textContent = "▶";
    progressBar.style.width = "0%";
  });

  spotifyRevealBtn.addEventListener("click", function () {
    if (typeof fbq === "function") {
      fbq("trackCustom", "SpotifyRevealClicked");
    }

    const appUrl = "spotify:artist:5eqThkuR9VjiLuYfzESTp7";
    const webUrl = "https://open.spotify.com/artist/5eqThkuR9VjiLuYfzESTp7";

    window.location.href = appUrl;

    setTimeout(function () {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }, 1200);
  });

});
