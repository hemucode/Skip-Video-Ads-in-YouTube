browser.runtime.onStartup.addListener(async () => {
  var a = new Promise(function(resolve, reject){
        browser.storage.local.get({"enabled": true}, function(options){
            resolve(options.enabled);
      })
  });

  const enabled = await a;
  console.log(enabled);
  if (enabled) {
    await enable();
  } else {
    await disable();
  }
});

browser.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace !== "local") return;

  if (changes.enabled) {
    if (changes.enabled.newValue) {
      await enable();
    } else {
      await disable();
    }
  }

});

async function enable() {
  browser.browserAction.setIcon({
    path: {
      32: "images/icon-32.png",
      38: "images/icon-38.png",
      128: "images/icon-128.png",
    },
  });
  await reloadAffectedTab();
}

/**
 * @returns Promise
 */
async function disable() {
  browser.browserAction.setIcon({
    path: {
      32: "images/icon-disabled-32.png",
      38: "images/icon-disabled-38.png",
      128: "images/icon-disabled-128.png",
    },
  });
  await reloadAffectedTab();
}

/**
 * @returns Promise
 */


async function reloadAffectedTab() {
  const [currentTab] = await browser.tabs.query({
    active: true,
    url: "*://*.youtube.com/*",
  });
  const isTabAffected = Boolean(currentTab?.url);
  if (isTabAffected) {
    return browser.tabs.reload();
  }
}

