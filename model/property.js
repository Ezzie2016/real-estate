
const mongoose = require('mongoose');

const pSchema = mongoose.Schema({
    username:{type:String, required:true},
    pname:{type:String, required:true},
    description:{type:String, required:true},
    propertyType:{type:String, required:true},
    dealType:{type:String, required:true},
    price:{type:Number, required:true},
    totalPackage:{type:Number, required:true},
    numberOfRooms:{type:String, required:true},
    numberOfToilets:{type:String, required:true},
    numberOfBathrooms:{type:String, required:true},
    squaremeter:{type:Number, required:true},
    address: {type:String,required:true},
    location:{type:String, required:true},
    state:{type:String,required:true},
    whatsapp:{type:String, required:true},
     image:{data:Buffer, contentType:String},
    dateRegistered: {type:Date, default:Date.now}

})

// Every public page filters by dealType (and search by location); the
// dashboard lists a realtor's own properties newest-first.
pSchema.index({dealType: 1, location: 1, dateRegistered: -1});
pSchema.index({location: 1});
pSchema.index({username: 1, dateRegistered: -1});

module.exports = new mongoose.model('property', pSchema)