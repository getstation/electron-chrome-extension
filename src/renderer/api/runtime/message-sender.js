const constants = require('../../../common/constants');
const Tab = require('./tab')

class MessageSender {
  constructor({ tabId, extensionId, url }) {
    this.tab = tabId ? new Tab(tabId, `${constants.EXTENSION_PROTOCOL}://${extensionId}`) : null;
    this.id = extensionId;
    this.url = url ? url : `${constants.EXTENSION_PROTOCOL}://${extensionId}`;
  }
}

module.exports = MessageSender;

