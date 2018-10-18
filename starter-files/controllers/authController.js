const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'Login Successful'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  //first check if user is authenticated
  if (req.isAuthenticated()) {
    next(); //Carry on they are logged in
    return;
  }

  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};
