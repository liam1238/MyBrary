if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
    console.log(process.env.DATABASE_URL);

}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))


const mongoose = require('mongoose');
// Connection URI
const uri = process.env.DATABASE_URL; 
// Connect to MongoDB
mongoose.connect(uri);
// Get the default connection
const db = mongoose.connection;
// Bind connection events
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB successfully!');
  // You can start using the database here
});

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

app.listen(process.env.PORT || 3000)