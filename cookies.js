document.addEventListener("DOMContentLoaded", function () {
  const panel = document.getElementById("cookiePanel");
  const closeBtn = document.getElementById("cookieClose");
  const saveBtn = document.getElementById("saveCookies");
  const denyBtn = document.getElementById("denyCookies");
  const marketingToggle = document.getElementById("marketingCookies");
  const settingsLink = document.getElementById("cookieSettingsLink");

  const savedPreference = localStorage.getItem("zoyaCookiePreferences");

  if (savedPreference) {
    const preferences = JSON.parse(savedPreference);
    marketingToggle.checked = preferences.marketing === true;
  } else {
    panel.classList.add("active");
  }

  function savePreferences(marketingAllowed) {
    const preferences = {
      necessary: true,
      marketing: marketingAllowed,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem("zoyaCookiePreferences", JSON.stringify(preferences));
    panel.classList.remove("active");
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

      const savedPreference = localStorage.getItem("zoyaCookiePreferences");

      if (savedPreference) {
        const preferences = JSON.parse(savedPreference);
        marketingToggle.checked = preferences.marketing === true;
      }

      panel.classList.add("active");
    });
  }
});
