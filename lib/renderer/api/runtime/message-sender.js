const constants = require('../../../common/constants');
const Tab = require('./tab')

class MessageSender {
  constructor (tabId, extensionId) {
    this.tab = tabId ? new Tab(tabId) : null;
    this.id = extensionId;
    this.url = `${constants.EXTENSION_PROTOCOL}://${extensionId}`;
  }
}

module.exports =  MessageSender;

