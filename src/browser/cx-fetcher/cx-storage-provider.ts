const path = require('path');
// const fs = require('fs');

export default {
  getDestinationFolder: (destination: string) => {
    return path.resolve(__dirname, destination);
  },
};
