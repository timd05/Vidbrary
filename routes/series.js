const express = require('express');
const router = express.Router();
const Serie = require('../models/serie');
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

// Route um alle Serien anzeigen zu lassen
router.get('/', async (req,res)=>{
    let query = Serie.find();
    try{
        const series = await query.exec(); // Führe die Datenbankabfrage aus
        res.render('serie/index', {
            series: series, // Serien an die Ansicht übergeben
        });
    } catch (err){
        console.log(err);
        res.redirect('/');
    }
});

// Route um zu einer neuen Serie zu gelangen
router.get('/new', (req,res)=>{
    const serie = new Serie();
    res.render('serie/new', {serie : serie});
});

// Route um eine neue Serie zu erstellen
router.post('/', upload.single('cover'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Kein Bild hochgeladen" });
    }

    const filePath = `/uploads/${req.file.filename}`; // URL zur Datei

    const serie = new Serie({
        name: req.body.name,
        Seasons: req.body.Seasons,
        rating: req.body.rating,
        actors: req.body.actors,
        description: req.body.description,
        director: req.body.director,
        firstPublished: req.body.firstPublished,
        cover: {
            data: fs.readFileSync(req.file.path), // Datei als Buffer speichern
            contentType: req.file.mimetype,
            filePath: filePath // URL speichern für den Zugriff
        }
    });

    try {
        await serie.save();
        res.redirect('/series');
    } catch (err) {
        console.log(err);
        res.redirect('/series/new');
    }
});

// Route um eine Serie anzeigen zu lassen
router.get('/:id', async(req,res)=>{
    try{
        const serie = await Serie.findById(req.params.id);
        res.render('serie/show', {serie : serie});
    } catch (err){
        console.log(err);
        res.redirect('/');
    }
});

// Route um Serien zu bearbeiten
router.get('/:id/edit', async(req,res)=>{
    try{
        const serie = await Serie.findById(req.params.id);
        res.render('serie/edit', {serie:serie});
    } catch(err){
        console.log(err);
        res.redirect('/')
    };
});

// Route um Serien zu updaten
router.put('/:id', upload.single('cover'), async(req,res)=>{
    let serie;
        try {
            serie = await serie.findById(req.params.id);
            serie.name = req.body.name;
            serie.Seasons = req.body.Seasons;
            serie.rating = req.body.rating;
            serie.actors = req.body.actors;
            serie.director = req.body.director;
            serie.firstPublished = new Date(req.body.firstPublished);
            serie.description = req.body.description;
    
            // Cover-Update nur, wenn eine neue Datei hochgeladen wurde
            if (req.file) {
                // Altes Cover löschen, wenn es existiert
                if (serie.cover && serie.cover.filePath) {
                    const oldCoverPath = path.join(__dirname, '../public', serie.cover.filePath);
                    try {
                        await fs.promises.unlink(oldCoverPath); // Asynchron löschen
                    } catch (err) {
                        console.error("Fehler beim Löschen des alten Covers:", err);
                    }
                }
    
                // Neues Cover speichern
                const filePath = `/uploads/${req.file.filename}`;
                serie.cover = {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype,
                    filePath: filePath
                };
            }
    
            await serie.save();
            res.redirect('/series');
        } catch (err) {
            console.log(err);
            res.redirect('/');
        }
});

// Route um Series zu löschen
router.delete('/:id', async (req,res)=>{
    let serie;
    try{
        serie = await Serie.findById(req.params.id);
        await serie.deleteOne();
        // Altes Cover löschen
        const oldCoverPath = path.join(__dirname, '../public', serie.cover.filePath);
        try {
            await fs.promises.unlink(oldCoverPath); // Asynchron löschen
        } catch (err) {
            console.error("Fehler beim Löschen des alten Covers:", err);
        }
        res.redirect('/series')
    } catch (err){
        console.log(err);
        res.redirect('/');
    }
});

module.exports = router;