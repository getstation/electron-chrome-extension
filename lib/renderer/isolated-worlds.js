let id = 1000; // prevent from colliding with chrome/electron ids
const isolatedWorldsMap = {};

module.exports = {
  getIsolatedWorldId: function(extensionID) {
    if (isolatedWorldsMap[extensionID]) {
      return isolatedWorldsMap[extensionID]
    } else {
      id = id + 1
      return isolatedWorldsMap[extensionID] = id;
    }
  }
}