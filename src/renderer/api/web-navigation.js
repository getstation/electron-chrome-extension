const Event = require('./event')
const {ipcRenderer} = require('electron')
const constants = require('../../common/constants');


class WebNavigation {
  constructor () {
    this.onBeforeNavigate = new Event()
    this.onCompleted = new Event()

    ipcRenderer.on(constants.WEBNAVIGATION_ONBEFORENAVIGATE, (event, details) => {
      this.onBeforeNavigate.emit(details)
    })

    ipcRenderer.on(constants.WEBNAVIGATION_ONCOMPLETED, (event, details) => {
      this.onCompleted.emit(details)
    })
  }
}

exports.setup = () => {
  return new WebNavigation()
}
