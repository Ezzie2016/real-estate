const express = require('express'),
    router = express.Router();

    const{realtorSignup, realtorLogin, upload, upl, requireLogin, realtorSignupPost, loginPost,
         dashboard, addProperty, addPropertyPost, viewProperty,deleteProperty, logout} = require('../controller/realtorController');

    router.get('/signup', realtorSignup);
    router.get('/login', realtorLogin);
    router.post('/signup', upload.single('image'),  realtorSignupPost);
    router.post('/login', loginPost);
    router.get('/dashboard', requireLogin, dashboard);
    router.get('/addProperty', requireLogin, addProperty);
    router.post('/addProperty', requireLogin, upl.single('image'), addPropertyPost);
    router.get('/viewProperty', requireLogin, viewProperty);
    router.get('/delete/:pid', requireLogin, deleteProperty)
    router.get('/logout', logout);


    module.exports = router;