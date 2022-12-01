var Base64 = require('@frsource/base64');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return n;
}

var Base64__namespace = /*#__PURE__*/_interopNamespace(Base64);

const PLUGIN_NAME = "cp-visual-regression-diff";
const LINK_PREFIX = `#${PLUGIN_NAME}-`;
const OVERLAY_CLASS = `${PLUGIN_NAME}-overlay`;
var FILE_SUFFIX;
(function (FILE_SUFFIX) {
  FILE_SUFFIX["diff"] = ".diff";
  FILE_SUFFIX["actual"] = ".actual";
})(FILE_SUFFIX || (FILE_SUFFIX = {}));
const TASK = {
  getScreenshotPathInfo: `${PLUGIN_NAME}-getScreenshotPathInfo`,
  compareImages: `${PLUGIN_NAME}-compareImages`,
  approveImage: `${PLUGIN_NAME}-approveImage`,
  cleanupImages: `${PLUGIN_NAME}-cleanupImages`,
  doesFileExist: `${PLUGIN_NAME}-doesFileExist`
  /* c8 ignore next */
};

const constructCypressError = (log, err) => {
  // only way to throw & log the message properly in Cypress
  // https://github.com/cypress-io/cypress/blob/5f94cad3cb4126e0567290b957050c33e3a78e3c/packages/driver/src/cypress/error_utils.ts#L214-L216
  err.onFail = err => log.error(err);
  return err;
};
const getImagesDir = options => {
  const imagesDir = options.imagesDir || Cypress.env("pluginVisualRegressionImagesDir");
  // TODO: remove in 4.0.0
  if (imagesDir) {
    console.warn("@frsource/cypress-plugin-visual-regression-diff] `imagesDir` option is deprecated, use `imagesPath` instead (https://github.com/FRSOURCE/cypress-plugin-visual-regression-diff#configuration)");
  }
  return imagesDir;
};
const getConfig = options => {
  const imagesDir = getImagesDir(options);
  return {
    scaleFactor: Cypress.env("pluginVisualRegressionForceDeviceScaleFactor") === false ? 1 : 1 / window.devicePixelRatio,
    updateImages: options.updateImages || Cypress.env("pluginVisualRegressionUpdateImages") || false,
    imagesPath: imagesDir && `{spec_path}/${imagesDir}` || options.imagesPath || Cypress.env("pluginVisualRegressionImagesPath") || "{spec_path}/__image_snapshots__",
    maxDiffThreshold: options.maxDiffThreshold || Cypress.env("pluginVisualRegressionMaxDiffThreshold") || 0.01,
    diffConfig: options.diffConfig || Cypress.env("pluginVisualRegressionDiffConfig") || {},
    screenshotConfig: options.screenshotConfig || Cypress.env("pluginVisualRegressionScreenshotConfig") || {},
    matchAgainstPath: options.matchAgainstPath || undefined
  };
};
Cypress.Commands.add("matchImage", {
  prevSubject: "optional"
}, (subject, options = {}) => {
  const $el = subject;
  let title;
  const {
    scaleFactor,
    updateImages,
    imagesPath,
    maxDiffThreshold,
    diffConfig,
    screenshotConfig,
    matchAgainstPath
  } = getConfig(options);
  const currentRetryNumber = cy.state("test").currentRetry();
  return cy.then(() => cy.task(TASK.getScreenshotPathInfo, {
    titleFromOptions: options.title || Cypress.currentTest.titlePath.join(" "),
    imagesPath,
    specPath: Cypress.spec.relative,
    currentRetryNumber
  }, {
    log: false
  })).then(({
    screenshotPath,
    title: titleFromTask
  }) => {
    title = titleFromTask;
    let imgPath;
    return ($el ? cy.wrap($el) : cy).screenshot(screenshotPath, {
      ...screenshotConfig,
      onAfterScreenshot(el, props) {
        imgPath = props.path;
        screenshotConfig.onAfterScreenshot == null ? void 0 : screenshotConfig.onAfterScreenshot(el, props);
      },
      log: false
    }).then(() => imgPath);
  }).then(imgPath => cy.task(TASK.compareImages, {
    scaleFactor,
    imgNew: imgPath,
    imgOld: matchAgainstPath || imgPath.replace(FILE_SUFFIX.actual, ""),
    updateImages,
    maxDiffThreshold,
    diffConfig
  }, {
    log: false
  }).then(res => ({
    res,
    imgPath
  }))).then(({
    res,
    imgPath
  }) => {
    const log = Cypress.log({
      name: "log",
      displayName: "Match image",
      $el
    });
    if (!res) {
      log.set("message", "Unexpected error!");
      throw constructCypressError(log, new Error("Unexpected error!"));
    }
    log.set("message", `${res.message}${res.imgDiffBase64 && res.imgNewBase64 && res.imgOldBase64 ? `\n[See comparison](${LINK_PREFIX}${Base64__namespace.encode(encodeURIComponent(JSON.stringify({
      title,
      imgPath,
      imgDiffBase64: res.imgDiffBase64,
      imgNewBase64: res.imgNewBase64,
      imgOldBase64: res.imgOldBase64,
      error: res.error
    })))})` : ""}`);
    if (res.error) {
      log.set("consoleProps", () => res);
      throw constructCypressError(log, new Error(res.message));
    }
    return {
      diffValue: res.imgDiff,
      imgNewPath: imgPath,
      imgPath: imgPath.replace(FILE_SUFFIX.actual, ""),
      imgDiffPath: imgPath.replace(FILE_SUFFIX.actual, FILE_SUFFIX.diff),
      imgNewBase64: res.imgNewBase64,
      imgBase64: res.imgOldBase64,
      imgDiffBase64: res.imgDiffBase64,
      imgNew: typeof res.imgNewBase64 === "string" ? Cypress.Buffer.from(res.imgNewBase64, "base64") : undefined,
      img: typeof res.imgOldBase64 === "string" ? Cypress.Buffer.from(res.imgOldBase64, "base64") : undefined,
      imgDiff: typeof res.imgDiffBase64 === "string" ? Cypress.Buffer.from(res.imgDiffBase64, "base64") : undefined
    };
  });
});

/* c8 ignore start */
function queueClear() {
  cy.queue.clear();
  cy.state("index", 0);
}
function queueRun() {
  // needed to run a task outside of the test processing flow
  cy.queue.run();
}
/* c8 ignore stop */
const generateOverlayTemplate = ({
  title,
  imgNewBase64,
  imgOldBase64,
  imgDiffBase64,
  wasImageNotUpdatedYet,
  error
}) => `<div class="${OVERLAY_CLASS} runner" style="position:fixed;z-index:10;top:0;bottom:0;left:0;right:0;display:flex;flex-flow:column">
  <header style="position:static">
  <nav style="display:flex;width:100%;align-items:center;justify-content:space-between;padding:10px 15px;">
    <h2>${title} - screenshot diff</h2>
    <form style="display:flex;align-items:center;gap:5px;text-align:right">
      ${wasImageNotUpdatedYet ? `<button type="submit"><i class="fa fa-check"></i> Update screenshot</button>` : error ? "Image was already updated, rerun test to see new comparison" : ""}
      <button type="button" data-type="close"><i class="fa fa-times"></i> Close</button>
    <form>
  </nav>
  </header>
  <div style="padding:15px;overflow:auto">
    <div style="display:flex;justify-content:space-evenly;align-items:flex-start;gap:15px">
      <div
        style="position:relative;background:#fff;border:solid 15px #fff"
        onmouseover="this.querySelector('div').style.opacity=0,this.querySelector('img').style.opacity=1"
        onmouseleave="this.querySelector('div').style.opacity=1,this.querySelector('img').style.opacity=0"
      >
        <h3>New screenshot (hover mouse away too see the old one):</h3>
        <img style="min-width:300px;width:100%;opacity:0" src="data:image/png;base64,${imgNewBase64}" />
        <div style="position:absolute;top:0;left:0;background:#fff">
          <h3>Old screenshot (hover over to see the new one):</h3>
          <img style="min-width:300px;width:100%" src="data:image/png;base64,${imgOldBase64}" />
        </div>
      </div>
      <div style="background:#fff;border:solid 15px #fff">
        <h3>Diff between new and old screenshot</h3>
        <img style="min-width:300px;width:100%" src="data:image/png;base64,${imgDiffBase64}" />
      </div>
    </div>
  </div>
</div>`;
/* c8 ignore start */
before(() => {
  if (!top) return null;
  Cypress.$(`.${OVERLAY_CLASS}`, top.document.body).remove();
});
after(() => {
  if (!top) return null;
  Cypress.$(top.document.body).on("click", `a[href^="${LINK_PREFIX}"]`, function (e) {
    e.preventDefault();
    if (!top) return false;
    const {
      title,
      imgPath,
      imgDiffBase64,
      imgNewBase64,
      imgOldBase64,
      error
    } = JSON.parse(decodeURIComponent(Base64__namespace.decode(e.currentTarget.getAttribute("href").substring(LINK_PREFIX.length))));
    queueClear();
    cy.task(TASK.cleanupImages, {
      log: false
    }).then(() => {
      cy.task(TASK.doesFileExist, {
        path: imgPath
      }, {
        log: false
      }).then(wasImageNotUpdatedYet => {
        if (!top) return false;
        queueClear();
        Cypress.$(generateOverlayTemplate({
          title,
          imgNewBase64,
          imgOldBase64,
          imgDiffBase64,
          error,
          wasImageNotUpdatedYet
        })).appendTo(top.document.body);
        const wrapper = Cypress.$(`.${OVERLAY_CLASS}`, top.document.body);
        wrapper.on("click", 'button[data-type="close"]', function () {
          wrapper.remove();
        });
        wrapper.on("submit", "form", function (e) {
          e.preventDefault();
          cy.task(TASK.approveImage, {
            img: imgPath
          }).then(() => wrapper.remove());
          queueRun();
        });
      });
      queueRun();
      return false;
    });
  });
});
/* c8 ignore stop */

exports.generateOverlayTemplate = generateOverlayTemplate;
//# sourceMappingURL=support.js.map
