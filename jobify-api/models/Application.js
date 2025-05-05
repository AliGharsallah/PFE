// models/Application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resume: String
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
