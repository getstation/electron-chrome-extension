const path = require('path');
// const fs = require('fs');

const getDestinationFolder = (destination: string) => path.resolve(__dirname, destination);

export default {
  getDestinationFolder,
};
