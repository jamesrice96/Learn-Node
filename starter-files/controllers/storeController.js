const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  req, flash('error', 'Something Happened');
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  //Req = Items from the form submit
  const store = await new Store(req.body).save();
  //Keep user updated on client side
  req.flash(
    'success',
    `Sucessfully Created ${store.name}. Care to leave a review?`
  );
  //Redirect to homepage
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  //1. Query the db for a list of the stores
  const stores = await Store.find();
  res.render('stores', { title: 'stores', stores });
};

exports.editStore = async (req, res) => {
  //1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  //res.json(store);
  //2.Confirm they are the owner of the store

  //3. Render out the edit form so user can update
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  //set thje location data to be a point - doesn't update
  req.body.location.type = 'Point';
  //1. Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, //Return the new store instead of the old store
    runValidators: true
  }).exec(); //Run Query
  //2. Redirect them to the store and tell them it worked
  req.flash(
    'success',
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${
      store.slug
    }">View Store</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};
