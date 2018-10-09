const express = require('express');
const router = express.Router();
// Controllers
const storeController = require('../controllers/storeController');
// Error handling
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here - Catch errrors from helper
router.get('/', catchErrors(storeController.getStores));

router.get('/stores', catchErrors(storeController.getStores));

router.get('/add', storeController.addStore);

router.post(
  '/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

// Passing the id as a parameter to update the store
router.post(
  '/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug))

module.exports = router;
