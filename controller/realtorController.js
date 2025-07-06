
const mongoose = require('mongoose'),
      bcrypt = require('bcryptjs'),
      multer = require('multer'),
      nodemailer =require('nodemailer'),
      fs = require('fs'),
      path = require('path'),
      Realtor = require('../model/realtor'),
      Property = require('../model/property');



    //IMAGE UPLOAD FOR REALTORS
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads')) // Use path.join to ensure the correct path separator is used
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
let upload = multer({storage:storage});


//IMAGE UPLOAD FOR PROPERTIES
let st = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/img/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
let upl = multer({storage:st});





const realtorSignup = async(req, res) => {
    res.render('signup');
}

const realtorLogin = async(req, res) => {
    res.render('login');
}

const realtorSignupPost = async(req, res) => {

        const{fn, ln, email, whatsapp, userCategory, username, password, password1} = req.body;

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

        if(errors.length > 0) {
            res.render('signup', {errors, fn, ln, email, whatsapp, userCategory,username, password, password1})
        } else {
            //MEANING THAT THERE'S NO ERROR
            //WE DON'T WANT 2 USERS TO HAVE THE SAME EMAIL AND USERNAME
            try{
                const record = await Realtor.find({email:email, username:username})
                if(record.length > 0) { //MEANING THAT SOMEONE WITH THE EMAIL AND USERNAME ALREADY EXISTS
                    errors.push({msg: "Email and Username already exists"})
                    res.render('signup', {errors, fn, ln, email, whatsapp, userCategory,username, password, password1})
                } else {
                    //WE ARE GOOD TO GO i.e. MEANING THAT WE CAN REGISTER THIS USER
                    //BELOW WE HASH THE REALTOR'S PASSWORD
                    bcrypt.hash(password, 10, (error, hash) => { 
                        const newRealtor = new Realtor({fn, ln, email, whatsapp, userCategory, username, 
                                                        password:hash,
                                                        image:{
                                                            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                                                            contentType:'image/png'
                                                        }
                                                    })

                                                    try{
                                                        newRealtor.save();
                                                        req.flash('message', 'Registration Successful. Now you can login');
                                                        res.redirect('/login');
                                                    }
                                                    catch(err) {
                                                        req.flash('error_msg', 'Could not save into the Database');
                                                    }
                    })
                }
            }
            catch(e){
                req.flash('error_msg', 'Something went wrong');
                console.log(e);
            }
        }

}

const loginPost = async(req, res) => {

        const{username, password} = req.body;
        try{
            const rec = await Realtor.findOne({username:username})
            if(!rec){
                req.flash('error_msg', "Username does not exist");
                res.redirect('/login');
            } else {
                // res.send("There's a record");
                // console.log(rec);

                bcrypt.compare(password, rec.password,(err, isVerified) =>{
                if(err){
                    req.flash("error_msg", "Something Appears Wrong");
                    res.redirect("/login");
                }

                if(isVerified){
                    //BELOW WE ESTABLISH SESSION VARIABLES
                    req.session.realtor_id = rec._id;
                    req.session.username = rec.username;
                    req.session.profilepicture = rec.image;
                    

                    //BELOW WE REDIRECT MERCHANT INTO THE DASHBOARD PAGE/ROUTE
                    res.redirect("/dashboard")
                }else{
                    req.flash("error_msg", "Invalid Password");
                    res.redirect("/login");
                }
            })
            }
        }
        catch(e) {
            req.flash('error_msg', "Something seem wrong");
            res.redirect('/login');
            console.log(e)
        }    
}

const dashboard = async(req, res) => {
        if(!req.session.realtor_id && !req.session.username) {
            res.redirect('/login');
        } else {
            const rid = req.session.realtor_id;
            const uname = req.session.username;

            res.render('dashboard', {rid, uname});
        }
}


const addProperty = async(req, res) => {
     if(!req.session.realtor_id && !req.session.username) {
            res.redirect('/login');
        } else {
            const rid = req.session.realtor_id;
            const uname = req.session.username;

            res.render('add_property', {rid, uname});
        }
}

const addPropertyPost = async(req,res)=> {
    // res.send("Processing");
    // console.log(req.body);
    const {pname, description, propertyType,dealType,price, totalPackage,
        numberOfRooms, numberOfToilets, numberOfBathrooms,squaremeter,
    address, location,state, whatsapp} = req.body;
     

    try{
       const pprice = Number(price);
       const ttotalPackage = Number(totalPackage);
       const sqm = Number(squaremeter);
        const nProperty = new Property({
           username:req.session.username, pname, description, propertyType,dealType,price:pprice, totalPackage:ttotalPackage,
        numberOfRooms, numberOfToilets, numberOfBathrooms,squaremeter:sqm,
    address, location,state, whatsapp,
    image: {
              data: fs.readFileSync(path.join('./public/img/' + req.file.filename)),
              contentType: 'image/png'
            }
        })
        nProperty.save();
        req.flash('message', "Data Successfully Captured");
        res.redirect('/addProperty');


    }
    catch(e){
        req.flash('error_msg', "Could not save to DB");
        res.redirect('/addProperty');
        console.log(e)
    }
}


const viewProperty = async(req, res) => {
        if(!req.session.realtor_id && !req.session.username) {
            res.redirect('/login');
        } else {
            const rid = req.session.realtor_id;
            const uname = req.session.username;

            try{
                const records = await Property.find({username:uname})
                res.render('view_property', {rid, uname,records});
            }
            catch(e){
                req.flash('error_msg', "Could not select from DB");
                res.redirect('/viewProperty');
            }

            
        }
}


const deleteProperty = async(req, res) => {
        if(!req.session.realtor_id && !req.session.username) {
            res.redirect('/login');
        } else {
            // const rid = req.session.realtor_id;
            // const uname = req.session.username;
            const property_id = req.params.pid;

            try{
                const del = await Property.findByIdAndDelete(property_id)
                res.redirect('/viewProperty');
            }
            catch(e){
                req.flash('error_msg', "Could not delete records");
                res.redirect('/viewProperty');
            }

            
        }
}


const logout = async(req, res)=>{
    res.session.destroy();
    res.redirect('/login');
}



module.exports = {realtorSignup, realtorLogin, upload, upl, realtorSignupPost, loginPost, 
    dashboard, addProperty, addPropertyPost, viewProperty, deleteProperty, logout}