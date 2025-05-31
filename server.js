// Benötigt um Umgebungsvariable zu laden, aber nur, wenn lokal, da in einer
// Produktionsumgebung (z.B. Server) auf anderem Weg Umgebungsvariablen bereitgestellt werden
if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const multer = require('multer');
const app = express();
const port = 8080;

// Router
const indexRouter = require('./routes/index');
const movieRouter = require('./routes/movies');
const seriesRouter = require('./routes/series');
const searchRouter = require('./routes/search');

// EJS als Template-Engine verwenden
app.set("view engine", "ejs");
// Definiert aus welchem Ordner die Views geladen werden sollen
app.set('views', __dirname + '/views');
// Übergeordnete Datei wird festgelegt, in die andere EJS-Dateien eingebettet werden
app.set('layout', 'layouts/layout');
// Middleware wird aktiviert
app.use(expressLayouts);
// Ermöglicht Verwendung HTTP-Methoden PUT/DELETE, die in HTML-Formularen 
// normalerweise nicht unterstützt werden.
app.use(methodOverride('_method'));
// Alle Dateien in '/public' als statische Dateien verfügbar gemacht
app.use(express.static('public'));
// Damit Formulardaten im Request-Body ausgelesen werden können
app.use(bodyParser.urlencoded({limit : '10mb', extended : true }));
// Zum auslesen von JSON-Dateien
app.use(bodyParser.json())

// Verbindung zur Datenbank
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.error('Successfully connected to Database...'));

// Router nutzen
app.use('/',indexRouter);
app.use('/movies',movieRouter);
app.use('/series',seriesRouter);
app.use('/search',searchRouter);

app.listen(port, ()=>{
    console.log(`Connected on Port ${port}...`);
});