/* ZOYA website analytics: counts visits and clicks, sent to /api/track (see _analytics-worker).
   No cookies, nothing stored in the browser, no names or email addresses.
   Built the same way as the links.zoyasmusic.com page. */
(function () {
  "use strict";

  // Never send events while working on the site locally or through a preview link.
  if (!/(^|\.)zoyasmusic\.com$/.test(location.hostname)) return;

  // Fires once, never delays the link it's attached to: sendBeacon queues the
  // request and returns immediately, so the browser can navigate away right after.
  function track(type, target, label) {
    try {
      var payload = JSON.stringify({
        type: type,
        target: target || "",
        label: label || "",
        path: location.pathname,
        referrer: document.referrer,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(function () {});
      }
    } catch (e) {
      /* analytics should never be able to break the page */
    }
  }

  var text = function (el) { return (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim(); };

  // Popup buttons on the homepage: Spotify, Apple Music, YouTube Music, YouTube
  var LISTEN = { popupSpotify: "Spotify", popupApple: "Apple Music", popupYTMusic: "YouTube Music", popupYouTube: "YouTube" };
  var SOCIAL_HOSTS = /(instagram|youtube|spotify|apple|facebook|tiktok|soundcloud|beatport)\./i;

  // One listener for the whole page, so it also catches elements added later.
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("a, button, .music-popup-trigger") : null;
    if (!el) return;

    // A release in the homepage carousel
    var release = el.closest(".music-popup-trigger");
    if (release) return track("release_open", release.dataset.title);

    // "Listen on" buttons in the release popup
    if (LISTEN[el.id]) {
      var title = document.getElementById("popupTitle");
      return track("listen_click", title ? title.textContent.trim() : "", LISTEN[el.id]);
    }

    if (el.id === "zoyaPlayPauseBtn") {
      if (!el.dataset.tracked) { el.dataset.tracked = "1"; track("preview_play", "Demo preview"); }
      return;
    }
    if (el.id === "zoyaSpotifyRevealBtn") return track("spotify_reveal");

    if (el.tagName !== "A") return;
    var href = el.getAttribute("href") || "";

    if (/^mailto:/i.test(href)) return track("email_click", href.slice(7).split("?")[0]);

    var url;
    try { url = new URL(href, location.href); } catch (err) { return; }

    // Social / streaming icons in the header and footer
    if (el.closest(".header-socials, .footer-icon-grid") && SOCIAL_HOSTS.test(url.hostname)) {
      return track("social", el.getAttribute("aria-label") || url.hostname.replace(/^www\./, ""));
    }

    if (url.host !== location.host && !/(^|\.)zoyasmusic\.com$/.test(url.hostname)) {
      return track("outbound", url.hostname.replace(/^www\./, ""), text(el));
    }

    if (el.closest(".navbar nav, .footer-nav")) return track("nav_click", text(el));
    if (el.classList.contains("button")) return track("cta_click", text(el));
  }, true);

  // Free download signup on the homepage: only that it happened, never the name or email.
  document.addEventListener("submit", function (e) {
    if (e.target && e.target.id === "zoyaSignupForm") track("signup_submit", "Free download");
  }, true);

  // The visit itself, with the campaign (utm_source) if the link had one.
  var campaign = new URLSearchParams(location.search).get("utm_source") || "";
  track("pageview", document.title, campaign);
})();
