const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const Serie = require('../models/serie');

// Route um nach Movies zu suchen
router.get('/movie', async (req,res)=>{
    // Movies suchen
    let query = Movie.find();
    if (req.query.name != null && req.query.name != ''){
        query = query.regex('name', new RegExp(req.query.name, 'i'));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', new Date(req.query.publishedBefore));
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', new Date(req.query.publishedAfter));
    }
    if (req.query.rating != null && req.query.rating !== '') {
        const rating = parseFloat(req.query.rating);
        if (!isNaN(rating)) {
            query = query.gte('rating', rating);
        }
    }    
    if (req.query.director != null && req.query.director != ''){
        query = query.regex('director', new RegExp(req.query.director));
    }
    try {
        const movies = await query.exec();
        res.render('search/movie', {
            movies : movies,
            searchOptions : req.query,
        });
    } catch (err){
        console.log(err);
        res.redirect('/');
    }
});

// Route um nach Serien zu suchen
router.get('/serie', async (req,res)=>{
    // Serien suchen
    let query = Serie.find();
    if (req.query.name != null && req.query.name != ''){
        query = query.regex('name', new RegExp(req.query.name, 'i'));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('firstPublished', new Date(req.query.publishedBefore));
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('firstPublished', new Date(req.query.publishedAfter));
    }
    if (req.query.rating != null && req.query.rating !== '') {
        const rating = parseFloat(req.query.rating);
        if (!isNaN(rating)) {
            query = query.gte('rating', rating);
        }
    } 
    if (req.query.director != null && req.query.director != ''){
        query = query.regex('director', new RegExp(req.query.director));
    }
    if (req.query.Seasons != null && req.query.Seasons !== '') {
        const Seasons = parseFloat(req.query.Seasons);
        if (!isNaN(Seasons)) {
            query = query.gte('Seasons', Seasons);
        }
    }
    try {
        const series = await query.exec();
        res.render('search/serie', {
            series : series,
            searchOptions : req.query
        });
    } catch {
        res.redirect('/');
    }
});

module.exports = router;