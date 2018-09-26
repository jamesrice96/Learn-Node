const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String]
});

storeSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next(); //Skip it
    return; // Stop this from running
  }
  this.slug = slug(this.name);
  next();
  //TODO make more resiliant so slugs are more unique
});

module.exports = mongoose.model('Store', storeSchema);
