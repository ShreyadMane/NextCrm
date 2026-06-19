const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

function initGridFS() {
  bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  return bucket;
}

module.exports = { initGridFS, get bucket() { return bucket; } };
