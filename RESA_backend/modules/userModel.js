const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        unique : true,
        require : true
    },
    password : {
        type : String,
        require : true
    },
    email : String,
    firstName : String,
    lastName : String,
    status : Number,
    creationDate : Date,
    role : String,
    profileImage: String
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;