// Isolated worlds
let id = 1000; // prevent from colliding with chrome/electron ids
const isolatedWorldsMap = {};

module.exports = {
  getIsolatedWorldId: function(extensionID) {
    if (isolatedWorldsMap[extensionID]) {
      return isolatedWorldsMap[extensionID]
    } else {
      return isolatedWorldsMap[extensionID] = id + 1;
    }
  }
}