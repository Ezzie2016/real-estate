const express = require('express'),
    router = express.Router();

    const{realtorSignup, realtorLogin, upload, upl, realtorSignupPost, loginPost,
         dashboard, addProperty, addPropertyPost, viewProperty,deleteProperty, logout} = require('../controller/realtorController');

    router.get('/signup', realtorSignup);
    router.get('/login', realtorLogin);
    router.post('/signup', upload.single('image'),  realtorSignupPost);
    router.post('/login', loginPost);
    router.get('/dashboard', dashboard);
    router.get('/addProperty', addProperty);
    router.post('/addProperty', upl.single('image'), addPropertyPost);
    router.get('/viewProperty', viewProperty);
    router.get('/delete/:pid', deleteProperty)
    router.get('/logout', logout);

    
    module.exports = router;



    