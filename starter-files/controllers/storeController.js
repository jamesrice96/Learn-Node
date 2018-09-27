const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  //Req = Items from the form submit
  const store = new Store(req.body);
  //Don't move along until store has saved
  await store.save();
  //Redirect to homepage
  res.redirect('/');
};
