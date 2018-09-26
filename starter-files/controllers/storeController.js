exports.myMiddleware = (req, res, next) => {
  req.name = 'james';
  next();
};

exports.homePage = (req, res) => {
  res.render('index');
};
