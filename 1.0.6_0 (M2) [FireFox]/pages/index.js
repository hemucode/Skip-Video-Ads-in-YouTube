async function init() {
  return Promise.all([translate(), hydrate()]);
}

function translate() {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll("[data-message]");
    for (const element of elements) {
      const key = element.dataset.message;
      const message = browser.i18n.getMessage(key);
      if (message) {
        element.textContent = message;
      } else {
        console.error("Missing browser.i18n message:", key);
      }
    }
    resolve();
  });
}

/**
 * @returns Promise
 */
async function hydrate() {

   var a = new Promise(function(resolve, reject){
        browser.storage.local.get({"enabled": true}, function(options){
            resolve(options.enabled);
        })
    });

  const enabled = await a;
  console.log(enabled);

  var c = new Promise(function(resolve, reject){
        browser.storage.local.get({"videoCount": 0}, function(options){
            resolve(options.videoCount);
        })
    });

  const videoCount = await c;
  console.log(videoCount);

  // Hydrate Logo
  const $logo = document.querySelector(".logo");
  $logo.style.filter = enabled ? "grayscale(0)" : "grayscale(100%)";
  $logo.style.opacity = enabled ? "1" : "0.7";

  // Hydrate Timesave info
  const $timeSaveInfo = document.querySelector(".timesave-info");
  const adTimePerVideo = 0.5;
  const timeSaved = Math.ceil(videoCount * adTimePerVideo);
  $timeSaveInfo.textContent = browser.i18n.getMessage("timesaveInfo", [
    new Intl.NumberFormat(undefined, {
      style: "unit",
      unit: "minute",
      unitDisplay: "long",
    }).format(timeSaved),
  ]);

  // Hydrate Checkbox Label
  const $checkboxLabel = document.querySelector("[data-message=enabled]");
  $checkboxLabel.textContent = browser.i18n.getMessage(
    enabled ? "enabled" : "disabled"
  );

  // Hydrate Checkbox Label
  const $enabledCheckbox = document.querySelector("input[name=enabled]");
  $enabledCheckbox.checked = enabled;
  $enabledCheckbox.addEventListener("change", async (event) => {
    const enabled = event.currentTarget.checked;

    // Persist
    await browser.storage.local.set({ enabled });

    // Update Checkbox Label
    $checkboxLabel.textContent = browser.i18n.getMessage(
      enabled ? "enabled" : "disabled"
    );

    // Update Logo
    $logo.style.filter = enabled ? "grayscale(0)" : "grayscale(100%)";
    $logo.style.opacity = enabled ? "1" : "0.7";
  });
}

init();
