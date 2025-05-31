const mongoose = require('mongoose');

// Datenbank Schema
const seriesSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    rating : {
        type : Number,
        required : true
    },
    Seasons : {
        type : Number,
        required : true
    },
    firstPublished : {
        type : Date,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    actors : {
        type : String,
        required : true
    },
    director : {
        type : String,
        required : true
    },
    cover: {
        data: { type: Buffer, required: true }, 
        contentType: { type: String, required: true },
        filePath: String // URL zum Bild im public/uploads-Ordner
    }
});

module.exports = mongoose.model('Serie', seriesSchema);