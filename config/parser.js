module.exports = {
  json: {
    limit: '10mb',
  },
  urlencoded: {
    extended: true, 
    limit: '10mb',
    parameterLimit: 1000000, 
  },
  fileFieldname: 'file',
};
