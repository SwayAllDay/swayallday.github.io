/* Cookie consent. Marketing tracking (the Meta Pixel) only loads after the visitor
   switches on marketing cookies, and stops again if they switch it off.
   A page turns the Pixel on by setting window.ZOYA_META_PIXEL_ID before this script. */

function zoyaReadCookiePreferences() {
  try {
    return JSON.parse(localStorage.getItem("zoyaCookiePreferences")) || null;
  } catch (e) {
    return null;
  }
}

var zoyaPixelLoaded = false;

function zoyaLoadMetaPixel() {
  var id = window.ZOYA_META_PIXEL_ID;
  if (!id) return;

  if (zoyaPixelLoaded) {
    // Already on the page (consent given earlier, then withdrawn): switch it back on.
    window.fbq("consent", "grant");
    return;
  }
  zoyaPixelLoaded = true;

  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq("init", id);
  window.fbq("track", "PageView");
  window.fbq("track", "ViewContent");
}

function zoyaRevokeMetaPixel() {
  // Stops the Pixel from sending anything else on this page; it won't load on the next page.
  if (zoyaPixelLoaded && typeof window.fbq === "function") window.fbq("consent", "revoke");
}

// Visitors who already allowed marketing cookies on an earlier visit.
(function () {
  var saved = zoyaReadCookiePreferences();
  if (saved && saved.marketing === true) zoyaLoadMetaPixel();
})();

document.addEventListener("DOMContentLoaded", function () {
  const panel = document.getElementById("cookiePanel");
  const closeBtn = document.getElementById("cookieClose");
  const saveBtn = document.getElementById("saveCookies");
  const denyBtn = document.getElementById("denyCookies");
  const marketingToggle = document.getElementById("marketingCookies");
  const settingsLink = document.getElementById("cookieSettingsLink");

  const savedPreference = zoyaReadCookiePreferences();

  if (savedPreference) {
    marketingToggle.checked = savedPreference.marketing === true;
  } else {
    panel.classList.add("active");
  }

  function savePreferences(marketingAllowed) {
    const preferences = {
      necessary: true,
      marketing: marketingAllowed,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem("zoyaCookiePreferences", JSON.stringify(preferences));
    } catch (e) {
      /* private browsing: the choice still applies to this page */
    }
    panel.classList.remove("active");

    if (marketingAllowed) zoyaLoadMetaPixel();
    else zoyaRevokeMetaPixel();
  }

  saveBtn.addEventListener("click", function () {
    savePreferences(marketingToggle.checked);
  });

  denyBtn.addEventListener("click", function () {
    marketingToggle.checked = false;
    savePreferences(false);
  });

  closeBtn.addEventListener("click", function () {
    panel.classList.remove("active");
  });

  if (settingsLink) {
    settingsLink.addEventListener("click", function (event) {
      event.preventDefault();

      const savedPreference = zoyaReadCookiePreferences();

      if (savedPreference) {
        marketingToggle.checked = savedPreference.marketing === true;
      }

      panel.classList.add("active");
    });
  }
});
