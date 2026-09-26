
const mongoose = require('mongoose');

const rSchema = mongoose.Schema({
        fn: {type:String,required:true},
        ln:{type:String,required:true},
        email: {type:String, required:true},
        whatsapp:{type:String,required:true},
        userCategory:{type:String, required:true},
        username: {type:String, required:true},
        password:{type:String,required:true},
        image:{data:Buffer, contentType:String},
        dateRegistered: {type:Date, default:Date.now}
})

// Login looks realtors up by username; signup checks username/email.
rSchema.index({username: 1});
rSchema.index({email: 1});

module.exports = new mongoose.model('realtor', rSchema);