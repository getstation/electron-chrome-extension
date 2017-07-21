
if (window.location.protocol === 'chrome-extension:') {
  // Add implementations of chrome API.
  require('./chrome-api').injectTo(window.location.hostname, isBackgroundPage, window)
  nodeIntegration = 'false'
} else if (window.location.protocol === 'chrome:') {
} else {
  // Inject content scripts.
  require('./content-scripts-injector')
}