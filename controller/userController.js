const mongoose = require('mongoose'),
      Property = require('../model/property');

//LISTING PAGES NEVER LOAD PHOTO BYTES FROM THE DATABASE. EACH PHOTO IS
//FETCHED BY THE BROWSER FROM /property/:id/image, WHERE IT CAN BE CACHED,
//INSTEAD OF BEING INLINED AS BASE64 INTO EVERY PAGE.
const findListings = (filter) =>
    Property.find(filter).select('-image').sort({dateRegistered: -1}).lean();

const landingPage = async(req, res) => {
    try{
        const [location, type] = await Promise.all([
            Property.distinct('location'),
            Property.distinct('dealType'),
        ]);
        res.render('index', {location, type});
    }
    catch(e){
        console.log(e);
        res.status(500).send("Something went wrong. Please try again.");
    }
}

const searchProperty = async(req, res) => {
    const{type, location} = req.body;
    try{
        const results = await findListings({dealType:type, location});
        res.render("search_result", {results, type, location})
    }
    catch(e){
        console.log(e);
        res.status(500).send("Search failed. Please try again.");
    }
}

//THE BUY, RENT, SHORTLET AND LAND PAGES ONLY DIFFER BY DEAL TYPE AND VIEW
const listingsByDealType = (dealType, view) => async(req, res) => {
    try{
        const results = await findListings({dealType})
        res.render(view, {results})
    }
    catch(e){
        console.log(e)
        res.status(500).send("Could not load listings. Please try again.");
    }
}

const shortlet = listingsByDealType('Shortlet', 'shortlet');
const buyProperty = listingsByDealType('Buy', 'purchase');
const rentProperty = listingsByDealType('Rent', 'rent');
const landProperty = listingsByDealType('Land', 'land');

const propertyImage = async(req, res) => {
    const {pid} = req.params;
    if(!mongoose.isValidObjectId(pid)) {
        return res.sendStatus(404);
    }
    try{
        const property = await Property.findById(pid).select('image').lean();
        const image = property && property.image;
        if(!image || !image.data) {
            return res.sendStatus(404);
        }
        const contentType = /^image\//.test(image.contentType || '') ? image.contentType : 'image/png';
        //A LISTING'S PHOTO NEVER CHANGES (THERE IS NO EDIT), SO BROWSERS CAN
        //KEEP IT FOR A YEAR
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        res.type(contentType).send(Buffer.from(image.data.buffer || image.data));
    }
    catch(e){
        console.log(e);
        res.sendStatus(500);
    }
}

module.exports = {landingPage, searchProperty, buyProperty, rentProperty, shortlet, landProperty, propertyImage}