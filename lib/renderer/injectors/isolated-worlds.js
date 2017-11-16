let id = 1000; // prevent from colliding with chrome/electron ids
const IsolatedWorldsRegistry = {};

module.exports = {
  getIsolatedWorldId: function(extensionID) {
    if (IsolatedWorldsRegistry[extensionID]) {
      return IsolatedWorldsRegistry[extensionID]
    } else {
      id = id + 1;
      return IsolatedWorldsRegistry[extensionID] = id;
    }
  }
}