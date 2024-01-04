const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
    versionID : {
        type : String,
        required : true,
        unique : true
    },
    data : Array,
    creatorID : {
        type : String,
        required : true
    },
    creationDate : Date
});

const versionModel = mongoose.model("version", versionSchema);

module.exports = versionModel;