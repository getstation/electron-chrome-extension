const Event = require('./event');
const { ipcRenderer } = require('electron');
const constants = require('../../common/constants');

class ChromeWindowsAPIClient {
  constructor(extensionId) {
    this.WINDOW_ID_NONE = -1;
    this.WINDOW_ID_CURRENT = -2;

    this.onCreated = new Event();
    this.onRemoved = new Event();
    this.onFocusChanged = new Event();
  }

  get(windowId, getInfo, callback) {
    ipcRenderer.send(`${constants.WINDOWS_GET}`, windowId, getInfo);
    ipcRenderer.on(`${constants.WINDOWS_GET_RESULT}`, (event, payload) => callback(payload));
  }

  getCurrent (getInfo, callback) {
    ipcRenderer.send(`${constants.WINDOWS_GET_CURRENT}`, getInfo);
    ipcRenderer.on(`${constants.WINDOWS_GET_CURRENT_RESULT}`, (event, payload) => callback(payload));
  }

  getLastFocused (getInfo, callback) {
    ipcRenderer.send(`${constants.WINDOWS_GET_LAST_FOCUSED}`, getInfo);
    ipcRenderer.on(`${constants.WINDOWS_GET_LAST_FOCUSED_RESULT}`, (event, payload) => callback(payload));
  }

  getAll (getInfo, callback) {
    ipcRenderer.send(`${constants.WINDOWS_GET_ALL}`, getInfo);
    ipcRenderer.on(`${constants.WINDOWS_GET_ALL_RESULT}`, (event, payload) => callback(payload));
  }

  create (createData, callback) {
    ipcRenderer.send(`${constants.WINDOWS_CREATE}`, createData);
    ipcRenderer.on(`${constants.WINDOWS_CREATE_RESULT}`, (event, payload) => callback && callback(payload));
  }

  update (windowId, updateInfo, callback) {
    ipcRenderer.send(`${constants.WINDOWS_UPDATE}`, windowId, updateInfo);
    ipcRenderer.on(`${constants.WINDOWS_UPDATE_RESULT}`, (event, payload) => callback && callback(payload));
  }

  remove (windowId, callback) {
    ipcRenderer.send(`${constants.WINDOWS_REMOVE}`, windowId);
    ipcRenderer.on(`${constants.WINDOWS_REMOVE_RESULT}`, () => callback && callback());
  }
}

exports.setup = extensionId => new ChromeWindowsAPIClient(extensionId);
