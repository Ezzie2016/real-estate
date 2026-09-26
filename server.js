const express = require('express'),
      mongoose = require('mongoose'),
      session = require('express-session'),
      flash = require('connect-flash'),
      multer = require('multer'),
      uRoute = require('./route/userRoute'),
      rRoute = require('./route/realtorRoute'),
      app = express();


    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/naijaHomes';
    const PORT = process.env.PORT || 5500;

    if(!process.env.SESSION_SECRET) {
        console.log('WARNING: SESSION_SECRET is not set - using the insecure default. Set it in production.');
    }

    mongoose.connect(MONGODB_URI)
        .then(() => console.log('MongoDB Connected'))
        .catch((e) => {
            console.log('MongoDB connection failed:', e.message);
            process.exit(1);
        });


      app.set('view engine', 'ejs');
      //CSS, LOGOS AND BACKGROUNDS RARELY CHANGE - LET BROWSERS CACHE THEM
      app.use(express.static('public', {maxAge: '7d'}));
      app.use(express.urlencoded({extended:true}));

      app.use(session({
            secret: process.env.SESSION_SECRET || "mysecretkey",
            //ONLY STORE A SESSION WHEN SOMETHING IS PUT IN IT (LOGIN OR A
            //FLASH MESSAGE), NOT ONE FOR EVERY VISITOR AND IMAGE REQUEST
            resave:false,
            saveUninitialized:false,
            cookie: {httpOnly: true, sameSite: 'lax'}
      }))


      app.use(flash());
      app.use((req,res, next) => {
        //READING FLASH MESSAGES WRITES AN EMPTY OBJECT INTO THE SESSION, WHICH
        //WOULD CREATE A SESSION FOR EVERY VISITOR - SO ONLY READ WHEN THERE ARE SOME
        const hasFlash = req.session.flash && Object.keys(req.session.flash).length > 0;
        res.locals.message = hasFlash ? req.flash("message") : [];
        res.locals.error_msg = hasFlash ? req.flash("error_msg") : [];

        next();
      })

      app.use('/', uRoute);
      app.use('/', rRoute);

      //UPLOAD ERRORS (E.G. FILE TOO LARGE) AND ANY OTHER UNEXPECTED ERROR
      app.use((err, req, res, next) => {
        console.log(err);
        if(err instanceof multer.MulterError) {
            req.flash('error_msg', 'Upload failed: ' + err.message);
            return res.redirect(req.get('Referrer') || '/');
        }
        res.status(500).send('Something went wrong. Please try again.');
      })


      app.listen(PORT, ()=> console.log("Server started on port " + PORT));