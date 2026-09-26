const mongoose = require('mongoose'),
      bcrypt = require('bcryptjs'),
      multer = require('multer'),
      Realtor = require('../model/realtor'),
      Property = require('../model/property');



//IMAGE UPLOADS (REALTOR PROFILE PICTURES AND PROPERTY PHOTOS)
//Files are kept in memory and saved straight into MongoDB. Writing them to
//disk first and reading them back with readFileSync blocked the whole server
//and left a duplicate copy of every photo on disk.
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024}, // 5MB
    fileFilter: (req, file, cb) => {
        //SVG can carry scripts, so only accept raster images
        cb(null, /^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype));
    }
});
let upload = imageUpload;
let upl = imageUpload;

const imageFromUpload = (file) => ({data: file.buffer, contentType: file.mimetype});



//ONLY LOGGED IN REALTORS CAN SEE THE DASHBOARD PAGES
const requireLogin = (req, res, next) => {
    if(!req.session.realtor_id) {
        return res.redirect('/login');
    }
    next();
}


const realtorSignup = async(req, res) => {
    res.render('signup');
}

const realtorLogin = async(req, res) => {
    res.render('login');
}

const realtorSignupPost = async(req, res) => {

        const{fn, ln, email, whatsapp, userCategory, username, password = '', password1} = req.body;

        let errors = [];

        if(!fn || !ln || !email || !whatsapp || !userCategory || !username || !password || !password1) {
            errors.push({msg:"Some fields are missing. Please fill all fields"})
        }

        if(password.length < 6) {
            errors.push({msg:"Password should be atleast 6 characters"})
        }

        if(password !== password1){
            errors.push({msg:"Passwords do not match"})
        }

        if(!req.file) {
            errors.push({msg:"Please upload a profile picture (PNG, JPG, GIF or WEBP, max 5MB)"})
        }

        if(errors.length > 0) {
            return res.render('signup', {errors, fn, ln, email, whatsapp, userCategory, username})
        }

        //MEANING THAT THERE'S NO ERROR
        //WE DON'T WANT 2 USERS TO HAVE THE SAME EMAIL OR USERNAME
        try{
            const existing = await Realtor.exists({$or: [{email}, {username}]});
            if(existing) {
                errors.push({msg: "Email or Username already exists"})
                return res.render('signup', {errors, fn, ln, email, whatsapp, userCategory, username})
            }

            //WE ARE GOOD TO GO i.e. MEANING THAT WE CAN REGISTER THIS USER
            //BELOW WE HASH THE REALTOR'S PASSWORD
            const hash = await bcrypt.hash(password, 10);
            await Realtor.create({fn, ln, email, whatsapp, userCategory, username,
                                  password: hash,
                                  image: imageFromUpload(req.file)});

            req.flash('message', 'Registration Successful. Now you can login');
            res.redirect('/login');
        }
        catch(e){
            console.log(e);
            req.flash('error_msg', 'Could not save into the Database');
            res.redirect('/signup');
        }

}

const loginPost = async(req, res) => {

        const{username, password} = req.body;
        try{
            //ONLY FETCH WHAT LOGIN NEEDS, NOT THE PROFILE PICTURE
            const rec = await Realtor.findOne({username:username}).select('username password').lean();
            if(!rec){
                req.flash('error_msg', "Username does not exist");
                return res.redirect('/login');
            }

            const isVerified = await bcrypt.compare(password || '', rec.password);
            if(!isVerified){
                req.flash("error_msg", "Invalid Password");
                return res.redirect("/login");
            }

            //BELOW WE ESTABLISH SESSION VARIABLES
            //(THE PROFILE PICTURE IS NOT KEPT IN THE SESSION - IT WAS NEVER
            //DISPLAYED AND COPIED THE WHOLE IMAGE INTO EVERY SESSION)
            req.session.realtor_id = rec._id;
            req.session.username = rec.username;

            //BELOW WE REDIRECT REALTOR INTO THE DASHBOARD PAGE/ROUTE
            res.redirect("/dashboard")
        }
        catch(e) {
            console.log(e)
            req.flash('error_msg', "Something seem wrong");
            res.redirect('/login');
        }
}

const dashboard = async(req, res) => {
        const rid = req.session.realtor_id;
        const uname = req.session.username;

        res.render('dashboard', {rid, uname});
}


const addProperty = async(req, res) => {
        const rid = req.session.realtor_id;
        const uname = req.session.username;

        res.render('add_property', {rid, uname});
}

const addPropertyPost = async(req,res)=> {
    const {pname, description, propertyType,dealType,price, totalPackage,
        numberOfRooms, numberOfToilets, numberOfBathrooms,squaremeter,
    address, location,state, whatsapp} = req.body;

    if(!req.file) {
        req.flash('error_msg', "Please upload a property photo (PNG, JPG, GIF or WEBP, max 5MB)");
        return res.redirect('/addProperty');
    }

    try{
        await Property.create({
            username:req.session.username, pname, description, propertyType,dealType,
            price:Number(price), totalPackage:Number(totalPackage),
            numberOfRooms, numberOfToilets, numberOfBathrooms,squaremeter:Number(squaremeter),
            address, location,state, whatsapp,
            image: imageFromUpload(req.file)
        });
        req.flash('message', "Data Successfully Captured");
        res.redirect('/addProperty');
    }
    catch(e){
        console.log(e)
        req.flash('error_msg', "Could not save to DB. Please fill all fields");
        res.redirect('/addProperty');
    }
}


const viewProperty = async(req, res) => {
        const rid = req.session.realtor_id;
        const uname = req.session.username;

        try{
            //PHOTOS ARE LOADED SEPARATELY THROUGH /property/:id/image
            const records = await Property.find({username:uname})
                .select('-image')
                .sort({dateRegistered: -1})
                .lean();
            res.render('view_property', {rid, uname,records});
        }
        catch(e){
            console.log(e)
            res.status(500).send("Could not load your listings. Please try again.");
        }
}


const deleteProperty = async(req, res) => {
        const property_id = req.params.pid;

        try{
            //A REALTOR CAN ONLY DELETE THEIR OWN LISTINGS
            if(mongoose.isValidObjectId(property_id)) {
                await Property.deleteOne({_id: property_id, username: req.session.username});
            }
            res.redirect('/viewProperty');
        }
        catch(e){
            console.log(e)
            req.flash('error_msg', "Could not delete records");
            res.redirect('/viewProperty');
        }
}


const logout = async(req, res)=>{
    req.session.destroy(() => {
        res.redirect('/login');
    });
}



module.exports = {realtorSignup, realtorLogin, upload, upl, requireLogin, realtorSignupPost, loginPost,
    dashboard, addProperty, addPropertyPost, viewProperty, deleteProperty, logout}