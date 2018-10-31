const mongoose = require('mongoose');
const Store = mongoose.model('Store');
//Image upload stuff
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  }
};

exports.homePage = (req, res) => {
  req, flash('error', 'Something Happened');
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going!
  next();
};

exports.createStore = async (req, res) => {
  //Relationship link to the store and user
  req.body.author = req.user._id;
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

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own the store to edit it!');
  }
};

exports.editStore = async (req, res) => {
  //1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  //res.json(store);
  //2.Confirm they are the owner of the store
  confirmOwner(store, req.user);
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

exports.getStoreBySlug = async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    'author'
  );
  if (!store) return next();
  res.render('store', { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;

  const tagQuery = tag || { $exists: true };

  //Get all the tags from the stores
  const tagsPromise = Store.getTagsList();
  //Find stores where tag includes specific tag
  const storesPromise = Store.find({ tags: tagQuery });

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tags', { tags, title: 'Tags', tag, stores });
};

exports.searchStores = async (req, res) => {
  const stores = await Store
    //First find sotre that matces
    .find(
      {
        $text: {
          $search: req.query.q
        }
      },
      {
        score: {
          $meta: 'textScore'
        }
      }
    )
    //Sort these stores
    .sort({
      score: { $meta: 'textScore' }
    })
    .limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  //res.json(coordinates);

  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 //10km
      }
    }
  };

  const stores = await Store.find(q)
    .select('slug name description location photo')
    .limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};
