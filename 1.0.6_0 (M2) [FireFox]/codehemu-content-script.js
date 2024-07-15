/**
 * By @Codehemu - https://github.com/hemucode/Skip-Video-Ads-in-YouTube/ ( JS: MIT License)
 * License - https://github.com/hemucode/Skip-Video-Ads-in-YouTube/blob/main/LICENSE ( CSS: MIT License)
 */

const WEBSTORE = `https://browser.google.com/webstore/detail/${browser.runtime.id}`;
const WEBSTORE_REVIEW = `${WEBSTORE}/reviews`;
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
  if (target.querySelector(".codehemu-branding")) {
    return;
  }

  //target.style.position = "relative";

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
  anchor.className = "codehemu-branding yt-formatted-string";
  anchor.href = WEBSTORE_REVIEW;
  anchor.textContent = `Please review then remove the watermark: `;
  anchor.target = "_blank";
  anchor.rel = "noopener";
  anchor.style.textDecoration = "none";
  anchor.style.color = "var(--yt-spec-text-secondary)";
  anchor.onclick = () => {
    browser.storage.local.set({
      isNotRateUs: false
    });
  }
  wrapper.appendChild(anchor);

  const dash = document.createTextNode(" - ");
  wrapper.appendChild(dash);

  const shareButton = document.createElement("button");
  shareButton.textContent = browser.i18n.getMessage("recommend") || "Recommend";
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
      title: browser.i18n.getMessage("extensionName"),
      text: browser.i18n.getMessage("extensionDescription"),
      url: WEBSTORE,
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
      new CosmeticFilter(this.adBlockSelectors).start();
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

  constructor(isPlayerContainer, 
    isSkipButtonContainer, 
    isSkipAdsEnabled, 
    lessCurrentTime,
    lessDurationTime, 
    minusDurationTime,
    isSpeedAdsEnabled, 
    videoSpeed) {
    this.isPlayerContainer = isPlayerContainer;
    this.isSkipButtonContainer = isSkipButtonContainer;
    this.lessCurrentTime = lessCurrentTime;
    this.lessDurationTime = lessDurationTime;
    this.minusDurationTime = minusDurationTime;
    this.isSpeedAdsEnabled = isSpeedAdsEnabled ;
    this.videoSpeed = videoSpeed;
    this.isSkipAdsEnabled = isSkipAdsEnabled;

  }

  start() {
    let isPlayerContainer = this.isPlayerContainer,
    isSkipButtonContainer = this.isSkipButtonContainer,
    lessCurrentTime = this.lessCurrentTime,
    lessDurationTime = this.lessDurationTime,
    minusDurationTime = this.minusDurationTime,
    isSpeedAdsEnabled = this.isSpeedAdsEnabled,
    videoSpeed = this.videoSpeed,
    isSkipAds = this.isSkipAdsEnabled,
    tigger = 0;
  
    clearInterval(tigger),
    tigger = setInterval(() => {
      let playerContainer = document.querySelector(isPlayerContainer),
      //skipButton = document.querySelector(isSkipButtonContainer),
      tigger = document.getElementById("yt-ext-info-bar");
      //errorScreen = document.querySelector("#error-screen");
      try{
        playerContainer ? (
        tigger && tigger.classList.remove("yt-ext-hidden"),
        playerContainer.volume = 0, 
        isSpeedAdsEnabled &&
        (playerContainer.playbackRate = videoSpeed),
        isSkipAds &&
        playerContainer.currentTime > lessCurrentTime && 
        playerContainer.currentTime < lessCurrentTime * 3 && 
        playerContainer.currentTime < playerContainer.duration && 
        playerContainer.duration > lessDurationTime && 
        (playerContainer.currentTime = playerContainer.duration - minusDurationTime)
        ) : tigger && tigger.classList.add("yt-ext-hidden")
      }catch (e) {
        console.error(e);
      }
    }, 550)

  }
}

class createRatingQuestion {
  isUpdatePopupEnabled = "";
  isRateUsPopupEnabled = "";
  isMessage = "";

  constructor(updateVersionFirefox,
    isRateUsPopupEnabled, 
    videoCount,
    nextRatingRequest, 
    isMessage, 
    isMessageURL) {
      this.videoCount = videoCount;
      this.nextRatingRequest = nextRatingRequest;
      this.updateVersionFirefox = updateVersionFirefox;
      this.isRateUsPopupEnabled = isRateUsPopupEnabled;
      this.isMessage = isMessage;
      this.isMessageURL = isMessageURL;
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

  createElement(content, url, text){
      const reviewButton = document.createElement("a");
      if (!url=="") {
        reviewButton.href = url;
        reviewButton.target = "_blank";
        reviewButton.rel = "noopener";
      }
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
      reviewButton.textContent = text;
      reviewButton.style.cursor = "pointer";
      content.appendChild(reviewButton);
      return reviewButton;
  
  }

  start() {
    if (isIframe()) {
      return;
    }

    if (!this.isMessage=="") {
      setTimeout(() => {
        const { close, header, content } = this.createDialog();
        header.textContent = "Massage"
        const button = this.createElement(content, this.isMessageURL, this.isMessage);
        button.addEventListener("click", () => {
          close();
        });
      },2000);
    }
    
    if (this.updateVersionFirefox > browser.runtime.getManifest().version) {
      setTimeout(() => {
          const { close, header, content } = this.createDialog();
          header.textContent = `Skip Video Ads in YouTube™ v ${browser.runtime.getManifest().version} available on the new version(${this.updateVersionFirefox}). Update it`;
          const button = this.createElement(content, WEBSTORE,"❤️ Update now");
          button.addEventListener("click", () => {
            close();
          });
      },2000);
    } else {
      if (this.isRateUsPopupEnabled && this.nextRatingRequest && this.videoCount > this.nextRatingRequest) {
        let videoCount = this.videoCount;
        setTimeout(() => {
            const { close, header, content } = this.createDialog();
            const adTimePerVideo = 0.5;
            const timeSaved = Math.ceil(videoCount * adTimePerVideo);
            header.textContent = browser.i18n.getMessage("timesaveInfo", [
              new Intl.NumberFormat(undefined, {
                style: "unit",
                unit: "minute",
                unitDisplay: "long",
              }).format(timeSaved),
            ]);

            const button = this.createElement(content,  WEBSTORE_REVIEW,`❤️ ${browser.i18n.getMessage("helpUsWithAReview")}`);
            button.addEventListener("click", () => {
              browser.storage.local.set({
                nextRatingRequest: false,
                isNotRateUs: false
              });
              close();
            });

            const button2 = this.createElement(content, "",`💨  ${browser.i18n.getMessage("later")}`);
            button2.addEventListener("click", () => {
              browser.storage.local.set({
                nextRatingRequest: videoCount + 10,
                isNotRateUs: true
              });
              close();
            });

            const button3 = this.createElement(content, "", `👎  ${browser.i18n.getMessage("dontAskAgain")}`);
            button3.addEventListener("click", () => {
              browser.storage.local.set({
                nextRatingRequest: false,
                isNotRateUs: true
              });
              close();
            });
        },2000);
      }
    }
  }
}

browser.runtime.sendMessage(
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
  var promise = new Promise((resolve, reject)=> {
      browser.storage.local.get({
        "enabled": true,
        "adBlockingSelectors": adBlockSelector,
        "isPlayerContainer": ".html5-video-player.ad-showing video",
        "isSkipButtonContainer": ".ytp-ad-skip-button",
        "isSkipAdsEnabled": true,
        "lessCurrentTime": 1.5,
        "lessDurationTime": 10,
        "minusDurationTime": 3,
        "isSpeedAdsEnabled": false,
        "videoSpeed": 2,
        "isRecommendEnabled": false,
        "isRateUsPopupEnabled": true,
        "updateVersionFirefox": browser.runtime.getManifest().version,
        "isMessage": "",
        "isMessageURL": "",
        "isNotRateUs": false,
        "videoCount": 0,
        "nextRatingRequest": 1

     }, (options)=>{
        resolve(options)
      })
  });

  const options = await promise;
  //console.log(options);

  try{
    const filters = [
        new CosmeticFilter(options.adBlockingSelectors),
        new SkipVideoAds(options.isPlayerContainer, options.isSkipButtonContainer, options.isSkipAdsEnabled, options.lessCurrentTime,options.lessDurationTime, options.minusDurationTime, options.isSpeedAdsEnabled, options.videoSpeed),
        new createRatingQuestion(options.updateVersionFirefox, options.isRateUsPopupEnabled, options.videoCount, options.nextRatingRequest, options.isMessage, options.isMessageURL)
    ];
     
    if (options.enabled) {
      filters.forEach((filter) => {
        filter.start();
      });
      await browser.storage.local.set({
        videoCount: options.videoCount + 1,
      });

    }
    if (options.enabled && (options.isRecommendEnabled || options.isNotRateUs)) {
      onVideoElementMutation(appendVideoIndicator);
    }



  }catch(err) {
    console.log(err.message);
  }
 
}









   
          

   
          
