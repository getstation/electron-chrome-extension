const { webContents } = require('electron');
const constants = require('../common/constants');

exports.clearCacheOnNavigation = () => {
  webContents.getAllWebContents().forEach(wc => {
    wc.send(`${constants.WEBREQUEST_CLEAR_CACHE}`)
  });
}
