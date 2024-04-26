const express = require('express');
const router = express.Router();
const Author = require('../models/author');

// All Authors Route
router.get('/', async (req, res, next) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        // Retrieve all authors from the database
        const authors = await Author.find(searchOptions);
        // Render the view and pass the authors data
        res.render('authors/index', { authors: authors, searchOptions: req.query });
    } catch (err) {
        // Pass an error message if there's an error
        const errorMessage = 'Error retrieving authors';
        res.render('authors/index', { errorMessage: errorMessage });
    }
});

// New Author Route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
});

// Create Author Route
router.post('/', async (req, res) => {

    const author = new Author({
        name: req.body.name
    });
    try {
        const newAuthor = await author.save();
        // Redirect to the authors page after successful save
        res.redirect('/authors');
    } catch (err) {
        // Render the new author form with an error message if save fails
        const errorMessage = 'Error Creating Author';
        res.render('authors/new', {
            // author: author,
            errorMessage: errorMessage
        });
    }
});

module.exports = router;
