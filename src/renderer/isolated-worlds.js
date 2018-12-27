// prevent from colliding with chrome/electron ids
// https://github.com/electron/electron/blob/c18afc924b7218555e529c0583773f58e1015cbe/atom/renderer/atom_render_frame_observer.h#L13
let id = 1000;
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
