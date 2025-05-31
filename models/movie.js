const mongoose = require('mongoose');

// Datenbank Schema
const movieSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    length : {
        type : Number,
        required : true
    },
    rating : {
        type : Number,
        required : true
    },
    actors : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    publishDate : {
        type : Date,
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

module.exports = mongoose.model('Movie', movieSchema);