const express = require('express'),
      ejs = require('ejs'),
      mongoose = require('mongoose'),
      session = require('express-session'),
      flash = require('connect-flash'),
      uRoute = require('./route/userRoute'),
      rRoute = require('./route/realtorRoute'),
      app = express();


    mongoose.connect('mongodb://127.0.0.1:27017/naijaHomes')
    try{
        console.log('MongoDB Connected')
    }
    catch(e) {
        console.log(e)
    }


      app.set('view engine', 'ejs');
      app.use(express.static('public'));
      app.use(express.urlencoded({extended:true}));

      app.use(session({
            secret:"mysecretkey",
            resave:true,
            saveUninitialized:true
      }))


      app.use(flash());
      app.use((req,res, next) => {
        res.locals.message = req.flash("message");
        res.locals.error_msg = req.flash("error_msg");

        next();
      })

      app.use('/', uRoute);
      app.use('/', rRoute);


      app.listen(5500, ()=> console.log("Server started on port 5500"));