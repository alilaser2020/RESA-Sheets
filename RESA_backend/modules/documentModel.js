const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    docID : {
        type : String,
        require : true,
        unique : true
    },
    name : {
        type : String,
        require : true
    },
    creatorID : {
        type : String,
        require : true
    },
    access : [String],
    versions : [String],
    public : Boolean,
    editable : Boolean
});

const documentModel = mongoose.model("document", documentSchema);

module.exports = documentModel;