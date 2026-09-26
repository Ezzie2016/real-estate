
const express = require('express'),
      router = express.Router();

const{landingPage, searchProperty, buyProperty, shortlet, landProperty, rentProperty, propertyImage} = require('../controller/userController');


router.get('/', landingPage);
router.post('/search', searchProperty);
router.get('/sales', buyProperty);
router.get('/rent', rentProperty);
router.get('/shortlets', shortlet);
router.get('/landedProperty', landProperty);
router.get('/property/:pid/image', propertyImage);

module.exports = router;