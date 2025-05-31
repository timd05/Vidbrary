const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const Serie = require('../models/serie');

router.get('/', async (req,res)=>{
    let movies;
    let series;
    try{
        movies = await Movie.find().sort({createAt:'desc'}).limit(10).exec();
    } catch {
        movies = [];
    }
    try{
        series = await Serie.find().sort({createAt:'desc'}).limit(10).exec();
    } catch {
        series = [];
    }
    res.render('index', {series : series, movies : movies});
});

module.exports = router;