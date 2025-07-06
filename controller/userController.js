
const mongoose = require('mongoose',
Property = require('../model/property')
)
const landingPage = async(req, res) => {
    try{
        const location = await Property.distinct('location');
        const type = await Property.distinct('dealType');
        res.render('index', {location, type});
        //res.send("Processing")
       // console.log(loc);
        //console.log(type);
//res.render('index');
    }
    catch(e){
        res.redirect('/');
    }
}

const searchProperty = async(req, res) => {
    //res.send("Processing");
    //console.log(req.body);
    const{type, location} = req.body;
    try{
        const results = await Property.find({dealType:type, location});
        res.render("search_result", {results, type, location}) 
       // console.log(results) 
       //res.send("Processing")         
    }
    catch(e){
        console.log(e);
    }
}

const shortlet = async(req, res) => {
    try{
        const results = await Property.find({dealType: 'Shortlet'})
        res.render('shortlet', {results})
    }
    catch(e){
        console.log(e)
    }
}


const buyProperty = async(req, res) => {
    try{
        const results = await Property.find({dealType: 'Buy'})
        res.render('purchase', {results})
    }
    catch(e){
        console.log(e)
    }
}

const rentProperty = async(req, res) =>{
    try{
        const results = await Property.find({dealType: 'Rent'})
        res.render('rent', {results})
    }
    catch(e){
        console.log(e)
    }
}




const landProperty = async(req, res) =>{
    try{
        const results = await Property.find({dealType: 'Land'})
        res.render('land', {results})
    }
    catch(e){
        console.log(e)
    }
}

module.exports = {landingPage, searchProperty, buyProperty, rentProperty, shortlet, landProperty}