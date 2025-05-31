const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Konfiguration (Speicherung im Speicher)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/uploads';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Eindeutiger Dateiname
    }
});
const upload = multer({ storage: storage });

// Route um alle Movies anzeigen zu lassen
router.get('/', async (req,res)=>{
    let query = Movie.find();
    try {
        const movies = await query.exec(); // Führe die Datenbankabfrage aus
        res.render('movie/index', {
            movies: movies, // Filme an die Ansicht übergeben
        });
    } catch {
        res.redirect('/');
    }
});

// Route um zu einem neuen Movie zu gelangen
router.get('/new', (req,res)=>{
    const movie = new Movie();
    res.render('movie/new', {movie : movie});
});

// Route um Movie zu erstellen
router.post('/', upload.single('cover'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Kein Bild hochgeladen" });
    }

    const filePath = `/uploads/${req.file.filename}`; // URL zur Datei

    const movie = new Movie({
        name: req.body.name,
        length: req.body.length,
        rating: req.body.rating,
        actors: req.body.actors,
        director: req.body.director,
        description: req.body.description,
        publishDate: req.body.publishDate,
        cover: {
            data: fs.readFileSync(req.file.path), // Datei als Buffer speichern
            contentType: req.file.mimetype,
            filePath: filePath // URL speichern für den Zugriff
        }
    });

    try {
        await movie.save();
        res.redirect('/movies');
    } catch (err) {
        console.log(err);
        res.redirect('/movies/new');
    }
});

// Route um Movies anzuzeigen
router.get('/:id', async (req, res)=>{
    try{
        const movie = await Movie.findById(req.params.id);
        res.render('movie/show', {movie : movie});
    } catch (err){
        console.log(err);
        res.redirect('/');
    }
});

// Route um Movies zu bearbeiten
router.get('/:id/edit', async (req,res)=>{
    try{
        const movie = await Movie.findById(req.params.id);
        res.render('movie/edit', {movie: movie});
    } catch (err){
        console.log(err);
        res.redirect('/');
    }
});

// Route um Movies zu updaten
router.put('/:id', upload.single('cover'), async (req, res) => {  // multer hinzugefügt
    let movie;
    try {
        movie = await Movie.findById(req.params.id);
        movie.name = req.body.name;
        movie.length = req.body.length;
        movie.rating = req.body.rating;
        movie.actors = req.body.actors;
        movie.director = req.body.director;
        movie.publishDate = new Date(req.body.publishDate);
        movie.description = req.body.description;

        // Cover-Update nur, wenn eine neue Datei hochgeladen wurde
        if (req.file) {
            // Altes Cover löschen, wenn es existiert
            if (movie.cover && movie.cover.filePath) {
                const oldCoverPath = path.join(__dirname, '../public', movie.cover.filePath);
                try {
                    await fs.promises.unlink(oldCoverPath); // Asynchron löschen
                } catch (err) {
                    console.error("Fehler beim Löschen des alten Covers:", err);
                }
            }

            // Neues Cover speichern
            const filePath = `/uploads/${req.file.filename}`;
            movie.cover = {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype,
                filePath: filePath
            };
        }

        await movie.save();
        res.redirect('/movies');
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// Route um Movies zu löschen
router.delete('/:id', async (req,res)=>{
    let movie;
    try{
        movie = await Movie.findById(req.params.id);
        await movie.deleteOne();
        // Altes Cover löschen
        const oldCoverPath = path.join(__dirname, '../public', movie.cover.filePath);
        try {
            await fs.promises.unlink(oldCoverPath); // Asynchron löschen
        } catch (err) {
            console.error("Fehler beim Löschen des alten Covers:", err);
        }
        res.redirect('/movies')
    } catch (err){
        console.log(err);
        res.redirect('/');
    }
});


module.exports = router;