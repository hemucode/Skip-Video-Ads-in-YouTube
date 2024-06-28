/**
 * By @Codehemu - https://github.com/hemucode/Skip-Video-Ads-in-YouTube/ ( JS: MIT License)
 * License - https://github.com/hemucode/Skip-Video-Ads-in-YouTube/blob/main/LICENSE ( CSS: MIT License)
 */

const isIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

const waitForDOMReady = async() =>{
  return new Promise((resolve) => {
    switch (document.readyState) {
      case "interactive":
      case "complete": {
        return resolve();
      }
      case "loading": {
        document.onreadystatechange = () => resolve();
      }
    }
  });
}

const onVideoElementMutation = async (callback) =>{
  await waitForDOMReady();
  const tagName = "YTD-PLAYER";
  const videoNode = document.getElementsByTagName(tagName)?.[0];
  if (videoNode) {
    callback(videoNode);
  }
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        if (mutation.target.nodeName === "YTD-PLAYER") {
          callback(mutation.target);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
  };
}


function appendVideoIndicator(target) {
  if (target.querySelector(".adblock-for-youtube-branding")) {
    return;
  }

  target.style.position = "relative";

  const wrapper = document.createElement("div");
  // Styles
  wrapper.style.display = "inline-block";
  wrapper.style.position = "absolute";
  wrapper.style.bottom = "-13px";
  wrapper.style.fontSize = "10px";
  wrapper.style.letterSpacing = "0.06rem";
  wrapper.style.opacity = 0.9;
  wrapper.style.right = 0;
  target.appendChild(wrapper);

  // Create Element
  const anchor = document.createElement("a");
  anchor.className = "adblock-for-youtube-branding yt-formatted-string";
  anchor.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
  anchor.textContent = chrome.i18n.getMessage("videoBranding");
  anchor.target = "_blank";
  anchor.rel = "noopener";
  anchor.style.textDecoration = "none";
  anchor.style.color = "var(--yt-spec-text-secondary)";
  wrapper.appendChild(anchor);

  const dash = document.createTextNode(" - ");
  wrapper.appendChild(dash);

  const shareButton = document.createElement("button");
  shareButton.textContent = chrome.i18n.getMessage("recommend") || "Recommend";
  shareButton.style.fontSize = "10px";
  shareButton.style.border = "none";
  shareButton.style.cursor = "pointer";
  shareButton.style.color = "var(--yt-spec-static-brand-white, white)";
  shareButton.style.background =
    "var(--yt-spec-brand-button-background, rgb(204, 0, 0))";

  shareButton.style.borderBottomLeftRadius = "3px";
  shareButton.onclick = (event) => {
    event.preventDefault();
    return navigator.share({
      title: chrome.i18n.getMessage("extensionName"),
      text: chrome.i18n.getMessage("extensionDescription"),
      url: `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`,
    });
  };

  wrapper.appendChild(shareButton);
}

class CosmeticFilter {
  adBlockSelectors = "";

  constructor(adBlockSelectors) {
    this.adBlockSelectors = adBlockSelectors;
  }

  start() {
    let headElement = document.head || document.getElementsByTagName("head")[0];
    let bodyElement = document.body || document.getElementsByTagName("body")[0];

    if (!headElement || !bodyElement) return void setTimeout((() => {
      new CosmeticFilter(this.adBlockSelectors,this.removeVideoAdsScript).start();
    }), 100);

    const newCssContent = `
    .yt-ext-hidden {
      display: none;
    }

    #yt-ext-info-bar {
      position: fixed;
      bottom: 20px;
      left: 20px;
      height: auto;
      border: 1px solid #ececec;
      background: red;
      z-index: 100000;
      padding: 5px 12px;
      color: white;
      font-size: 14px;
      border-radius: 4px;
    }

    .ad-container,
    .ad-div,
    .masthead-ad-control,
    .video-ads,
    .ytp-ad-progress-list,
    #ad_creative_3,
    #footer-ads,
    #masthead-ad,
    #player-ads,
    .ytd-mealbar-promo-renderer,
    #watch-channel-brand-div,
    #watch7-sidebar-ads,
    ytd-display-ad-renderer,
    ytd-compact-promoted-item-renderer,
    .html5-video-player.ad-showing video {
      display: none !important;
    }`;

    if (!document.getElementById("yt-extension-style")) {
      let styleElement = document.createElement("style");
      styleElement.id = "yt-extension-style",
      styleElement.appendChild(document.createTextNode(newCssContent)), 
      headElement.appendChild(styleElement);
    }

    if (!document.getElementById("yt-ext-info-bar")) {
        var divEl = document.createElement("div");
        divEl.id = "yt-ext-info-bar",
        divEl.innerText = "Skipping ads...", 
        divEl.classList.add("yt-ext-hidden"), 
        bodyElement.appendChild(divEl);
    }


    if (!this.adBlockSelectors) {
      return;
    }

    if (!document.getElementById("adBlock-Selectors")) {
      const cssContent = `${this.adBlockSelectors} { display: none !important; visibility: hidden !important;}`;
      const styleEl = document.createElement("style");
      styleEl.id = "adBlock-Selectors",
      styleEl.textContent = cssContent,
      headElement.appendChild(styleEl);
    }

  }

}

class SkipVideoAds {
  skipButtonContainer = ".ytp-ad-skip-button-container";
  videoCurrentTime = 1.5;
  videoDurationLessTime = 0.5;


  constructor(skipButtonContainer,videoCurrentTime,videoDurationLessTime) {
    this.skipButtonContainer = skipButtonContainer;
    this.videoCurrentTime = videoCurrentTime;
    this.videoDurationLessTime = videoDurationLessTime;
  }

  start() {
    let playerContainer = false,
    skipButton = this.skipButtonContainer,
    lessCurrentTime = this.videoCurrentTime,
    lessdurationTime = this.videoDurationLessTime,
    tigger = 0;

    clearInterval(tigger),
    tigger = setInterval((() => {
      (function () {
        if (!playerContainer) {
          document.querySelector(skipButton)?.click();        }
      })(),
      function () {
        let playerContainer = document.querySelector(".html5-video-player.ad-showing video"),
        tigger = document.getElementById("yt-ext-info-bar");
        try{
          playerContainer ? (
          tigger && tigger.classList.remove("yt-ext-hidden"),
          playerContainer.volume = 0, 
          playerContainer.paused && playerContainer.play(),
          playerContainer.currentTime > lessCurrentTime && playerContainer.currentTime < playerContainer.duration && 
          (playerContainer.currentTime = playerContainer.duration - lessdurationTime)) : tigger && tigger.classList.add("yt-ext-hidden")
        }catch (e) {
          console.error(e);
        }

      }()
    }), 550)

  }
}

class createRatingQuestion {
  isUpdatePopupEnabled = "";
  isRateUsPopupEnabled = "";
  isMessage = "";

  constructor(videoCount, nextRatingRequest, isUpdatePopupEnabled, isRateUsPopupEnabled, isMessage) {
    this.videoCount = videoCount;
    this.nextRatingRequest = nextRatingRequest;
    this.isUpdatePopupEnabled = isUpdatePopupEnabled;
    this.isRateUsPopupEnabled = isRateUsPopupEnabled;
    this.isMessage = isMessage;
  }

  createDialog (){
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.zIndex = 9999;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "#00000099";
    overlay.style.opacity = 1;
    overlay.style.transition = "opacity 1s ease";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "flex-start";

    function handleOverlayClick(event) {
      if (event.target === overlay) {
        return handleClose(event);
      }
    }

    function handleKeydown(event) {
      if (event.code === "Escape") {
        return handleClose(event);
      }
    }

    function handleClose(event) {
      overlay.style.opacity = 0;
      setTimeout(() => {
        overlay.parentElement.removeChild(overlay);
      }, 300);

      overlay.removeEventListener("click", handleOverlayClick);
      closeButton.removeEventListener("click", handleClose);
      window.removeEventListener("keypress", handleKeydown);
    }

    overlay.addEventListener("click", handleOverlayClick);
    window.addEventListener("keydown", handleKeydown);

    document.body.appendChild(overlay);

    const dialog = document.createElement("dialog");
    dialog.open = true;
    dialog.style.width = "300px";
    dialog.style.minHeight = "50px";
    dialog.style.border = "none";
    dialog.style.overflow = "auto";
    dialog.style.padding = "16px";
    dialog.style.marginTop = "48px";
    dialog.style.boxSizing = "border-box";
    dialog.style.maxHeight = "100%";
    dialog.style.boxShadow = "1px 1px 10px 0 #00000099";
    dialog.style.borderRadius = "2px";
    overlay.appendChild(dialog);

    const closeButton = document.createElement("button");
    closeButton["aria-label"] = "Cancel";
    closeButton.style.verticalAlign = "middle";
    closeButton.style.color = "inherit";
    closeButton.style.outline = "none";
    closeButton.style.background = "none";
    closeButton.style.float = "right";
    closeButton.style.margin = "0";
    closeButton.style.border = "none";
    closeButton.style.padding = "0";
    closeButton.style.width = "26px";
    closeButton.style.height = "26px";
    closeButton.style.lineHeight = "0";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", handleClose);
    dialog.appendChild(closeButton);

    const closeIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    closeIcon.setAttribute("viewBox", "0 0 24 24");
    closeIcon.focusable = false;
    closeButton.appendChild(closeIcon);

    const closePath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    closePath.setAttribute(
      "d",
      "M12.7,12l6.6,6.6l-0.7,0.7L12,12.7l-6.6,6.6l-0.7-0.7l6.6-6.6L4.6,5.4l0.7-0.7l6.6,6.6l6.6-6.6l0.7,0.7L12.7,12z"
    );
    closeIcon.appendChild(closePath);

    const header = document.createElement("h2");
    header.style.padding = "0 36px 16px 0px";
    header.style.fontSize = "var(--ytd-subheadline-font-size)";
    header.style.fontWeight = "var(--ytd-subheadline-font-weight)";
    header.style.lineHeight = "var(--ytd-subheadline-line-height)";
    header.style.letterSpacing = "var(--ytd-subheadline-letter-spacing)";
    dialog.appendChild(header);

    const content = document.createElement("div");
    dialog.appendChild(content);

    return {
      close: handleClose,
      overlay,
      dialog,
      header,
      content,
    };
  }

  start() {
    if (isIframe()) {
      return;
    }

    if (this.isUpdatePopupEnabled) {
      setTimeout(() => {
        const { close, header, content } = this.createDialog();
        header.textContent = `Skip Video Ads in YouTube™ v${chrome.runtime.getManifest().version} available on the new version. Update it`;
        const reviewButton = document.createElement("a");
        reviewButton.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
        reviewButton.target = "_blank";
        reviewButton.rel = "noopener";
        reviewButton.style.backgroundColor = "var(--yt-spec-badge-chip-background)";
        reviewButton.style.textTransform = "uppercase";
        reviewButton.style.color = "var(--yt-spec-text-primary)";
        reviewButton.style.display = "block";
        reviewButton.style.textDecoration = "none";
        reviewButton.style.whiteSpace = "pre";
        reviewButton.style.marginRight = "4px";
        reviewButton.style.marginBottom = "4px";
        reviewButton.style.fontSize = "14px";
        reviewButton.style.border = "1px solid var(--yt-spec-10-percent-layer)";
        reviewButton.style.width = "100%";
        reviewButton.style.borderRadius = "2px";
        reviewButton.style.padding = "10px 16px 10px 28px";
        reviewButton.style.textIndent = "-17px";
        reviewButton.style.boxSizing = "border-box";
        reviewButton.style.whiteSpace = "normal";
        reviewButton.style.textAlign = "left";
        reviewButton.textContent = `❤️ Update now`;
        reviewButton.style.cursor = "pointer";
        reviewButton.addEventListener("click", () => {
          chrome.storage.sync.set({
            nextRatingRequest: false,
          });
          close();
        });

        content.appendChild(reviewButton);
      },2000);
    }else if(!this.isMessage=="") {
        setTimeout(() => {
          const { close, header, content } = this.createDialog();
          header.textContent = `Message`;
          const reviewButton = document.createElement("a");
          reviewButton.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
          reviewButton.target = "_blank";
          reviewButton.rel = "noopener";
          reviewButton.style.backgroundColor = "var(--yt-spec-badge-chip-background)";
          reviewButton.style.textTransform = "uppercase";
          reviewButton.style.color = "var(--yt-spec-text-primary)";
          reviewButton.style.display = "block";
          reviewButton.style.textDecoration = "none";
          reviewButton.style.whiteSpace = "pre";
          reviewButton.style.marginRight = "4px";
          reviewButton.style.marginBottom = "4px";
          reviewButton.style.fontSize = "14px";
          reviewButton.style.border = "1px solid var(--yt-spec-10-percent-layer)";
          reviewButton.style.width = "100%";
          reviewButton.style.borderRadius = "2px";
          reviewButton.style.padding = "10px 16px 10px 28px";
          reviewButton.style.textIndent = "-17px";
          reviewButton.style.boxSizing = "border-box";
          reviewButton.style.whiteSpace = "normal";
          reviewButton.style.textAlign = "left";
          reviewButton.textContent = this.isMessage;
          reviewButton.style.cursor = "pointer";
          reviewButton.addEventListener("click", () => {
            chrome.storage.sync.set({
              nextRatingRequest: false,
            });
            close();
          });

          content.appendChild(reviewButton);
      },2000);
    }else if(this.isRateUsPopupEnabled && this.nextRatingRequest && this.videoCount > this.nextRatingRequest) {
      setTimeout(() => {
        let videoCount = this.videoCount;
        const { close, header, content } = this.createDialog();
        const adTimePerVideo = 0.5;
        const timeSaved = Math.ceil(videoCount * adTimePerVideo);

        header.textContent = chrome.i18n.getMessage("timesaveInfo", [
          new Intl.NumberFormat(undefined, {
            style: "unit",
            unit: "minute",
            unitDisplay: "long",
          }).format(timeSaved),
        ]);

        const reviewButton = document.createElement("a");
        reviewButton.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
        reviewButton.target = "_blank";
        reviewButton.rel = "noopener";
        reviewButton.style.backgroundColor = "var(--yt-spec-badge-chip-background)";
        reviewButton.style.textTransform = "uppercase";
        reviewButton.style.color = "var(--yt-spec-text-primary)";
        reviewButton.style.display = "block";
        reviewButton.style.textDecoration = "none";
        reviewButton.style.whiteSpace = "pre";
        reviewButton.style.marginRight = "4px";
        reviewButton.style.marginBottom = "4px";
        reviewButton.style.fontSize = "14px";
        reviewButton.style.border = "1px solid var(--yt-spec-10-percent-layer)";
        reviewButton.style.width = "100%";
        reviewButton.style.borderRadius = "2px";
        reviewButton.style.padding = "10px 16px 10px 28px";
        reviewButton.style.textIndent = "-17px";
        reviewButton.style.boxSizing = "border-box";
        reviewButton.style.whiteSpace = "normal";
        reviewButton.style.textAlign = "left";
        reviewButton.textContent = `❤️  ${chrome.i18n.getMessage(
          "helpUsWithAReview"
        )}`;
        reviewButton.style.cursor = "pointer";
        reviewButton.addEventListener("click", () => {
          chrome.storage.sync.set({
            nextRatingRequest: false,
          });
          close();
        });

        content.appendChild(reviewButton);

        const laterButton = document.createElement("button");
        laterButton.style.backgroundColor = "var(--yt-spec-badge-chip-background)";
        laterButton.style.textTransform = "uppercase";
        laterButton.style.whiteSpace = "pre";
        laterButton.style.color = "var(--yt-spec-text-primary)";
        laterButton.style.display = "block";
        laterButton.style.marginRight = "4px";
        laterButton.style.marginBottom = "4px";
        laterButton.style.fontSize = "14px";
        laterButton.style.border = "1px solid var(--yt-spec-10-percent-layer)";
        laterButton.style.width = "100%";
        laterButton.style.borderRadius = "2px";
        laterButton.style.padding = "10px 16px 10px 28px";
        laterButton.style.textIndent = "-17px";
        laterButton.style.whiteSpace = "normal";
        laterButton.style.cursor = "pointer";
        laterButton.style.boxSizing = "border-box";
        laterButton.style.textAlign = "left";
        laterButton.textContent = `💨  ${chrome.i18n.getMessage("later")}`;
        laterButton.addEventListener("click", () => {
          chrome.storage.sync.set({
            nextRatingRequest: videoCount + 100,
          });
          close();
        });
        content.appendChild(laterButton);

        const daaButton = document.createElement("button");
        daaButton.style.backgroundColor = "var(--yt-spec-badge-chip-background)";
        daaButton.style.textTransform = "uppercase";
        daaButton.style.whiteSpace = "pre";
        daaButton.style.color = "var(--yt-spec-text-primary)";
        daaButton.style.display = "block";
        daaButton.style.marginRight = "4px";
        daaButton.style.fontSize = "14px";
        daaButton.style.border = "1px solid var(--yt-spec-10-percent-layer)";
        daaButton.style.width = "100%";
        daaButton.style.borderRadius = "2px";
        daaButton.style.padding = "10px 16px 10px 28px";
        daaButton.style.textIndent = "-17px";
        daaButton.style.whiteSpace = "normal";
        daaButton.style.cursor = "pointer";
        daaButton.style.marginBottom = "0";
        daaButton.style.boxSizing = "border-box";
        daaButton.style.textAlign = "left";
        daaButton.textContent = `👎  ${chrome.i18n.getMessage("dontAskAgain")}`;
        daaButton.addEventListener("click", () => {
          chrome.storage.sync.set({
            nextRatingRequest: false,
          });
          close();
        });
        content.appendChild(daaButton);

      }, 2000);
    }
  }
}

chrome.runtime.sendMessage(
  {
    action: "PAGE_READY",
  },
  ({adBlockSelectors}) => {
    const pageUrl = new URL(window.location.href)
    if (/youtube\.com/.test(window.location.origin)) {
      info(adBlockSelectors);
    }
  }
);


async function info(adBlockSelector) {
  var enabledPromise = new Promise(function(resolve, reject){
        chrome.storage.sync.get({"enabled": true}, function(options){
            resolve(options.enabled);
        })
    });

  var adBlockSelectorsPromise = new Promise(function(resolve, reject){
    chrome.storage.sync.get({"adBlockingSelectors": adBlockSelector}, function(options){
        resolve(options.adBlockingSelectors);
      })
  });

  var videoCountPromise = new Promise(function(resolve, reject){
      chrome.storage.sync.get({"videoCount": 0}, function(options){
          resolve(options.videoCount);
      })
  });

  var nextRatingRequestPromise = new Promise(function(resolve, reject){
        chrome.storage.sync.get({"nextRatingRequest": 5}, function(options){
            resolve(options.nextRatingRequest);
        })
  });

  var skipButtonContainerPromise = new Promise(function(resolve, reject){
      chrome.storage.sync.get({"skipButtonContainer": ".ytp-ad-skip-button-container"}, function(options){
          resolve(options.skipButtonContainer);
    })
  });

  var videoCurrentTimePromise = new Promise(function(resolve, reject){
      chrome.storage.sync.get({"videoCurrentTime": 1.5}, function(options){
          resolve(options.videoCurrentTime);
    })
  });

  var videoDurationLessTimePromise = new Promise(function(resolve, reject){
      chrome.storage.sync.get({"videoDurationLessTime": 0.5}, function(options){
          resolve(options.videoDurationLessTime);
    })
  });

  var isUpdatePopupEnabledPromise = new Promise(function(resolve, reject){
      chrome.storage.sync.get({"isUpdatePopupEnabled": false}, function(options){
          resolve(options.isUpdatePopupEnabled);
    })
  });

  var isRateUsPopupEnabledPromise = new Promise(function(resolve, reject){
      chrome.storage.sync.get({"isRateUsPopupEnabled": true}, function(options){
          resolve(options.isRateUsPopupEnabled);
    })
  });

  var isMessagePromise = new Promise(function(resolve, reject){
      chrome.storage.sync.get({"isMessage": ""}, function(options){
          resolve(options.isMessage);
    })
  });

  const enabled = await enabledPromise;
  const adBlockSelectors = await adBlockSelectorsPromise;
  const videoCount = await videoCountPromise;
  const nextRatingRequest = await nextRatingRequestPromise;
  const skipButtonContainer = await skipButtonContainerPromise;
  const videoCurrentTime = await videoCurrentTimePromise;
  const videoDurationLessTime = await videoDurationLessTimePromise;
  const isUpdatePopupEnabled = await isUpdatePopupEnabledPromise;
  const isRateUsPopupEnabled = await isRateUsPopupEnabledPromise;
  const isMessage = await isMessagePromise;

  try{
    const filters = [
        new CosmeticFilter(adBlockSelectors),
        new SkipVideoAds(skipButtonContainer, videoCurrentTime, videoDurationLessTime),
        new createRatingQuestion(videoCount, nextRatingRequest, isUpdatePopupEnabled, isRateUsPopupEnabled, isMessage)
    ];
     
    if (enabled) {
      filters.forEach((filter) => {
        filter.start();
      });
    }

    console.log(`[Skip Video Ads in YouTube™ v${chrome.runtime.getManifest().version} Enabled]`);

    if (isRateUsPopupEnabled) {
      onVideoElementMutation(appendVideoIndicator);
    }

  }catch(err) {
    console.log(err.message);
  }
 
}



   
          






   
          

   
          
