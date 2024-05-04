const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

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
        res.redirect(`/authors/${newAuthor.id}`);
    } catch (err) {
        // Render the new author form with an error message if save fails
        const errorMessage = 'Error Creating Author';
        res.render('authors/new', {
            author: author,
            errorMessage: errorMessage
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).limit(6).exec()
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch (error) {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', { author: author });
    } catch (error) {
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch (err) {
        if (author == null) {
            res.redirect('/')
        } else {
            // Render the new author form with an error message if save fails
            const errorMessage = 'Error Updating Author';
            res.render('authors/edit', {
                author: author,
                errorMessage: errorMessage
            });
        }
    }
})

router.delete('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        await author.deleteOne();
        res.redirect('/authors');
    } catch (err) {
        if (author == null) {
            res.redirect('/')
        } else {
            console.log(err);
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router;
