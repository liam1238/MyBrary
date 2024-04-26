const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Book = require('../models/book');
const Author = require('../models/author');
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']    

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

// All Books Route
router.get('/', async (req, res, next) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title !== '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore !== '') {
        query = query.lte('publishDate', req.query.publishedBefore) // lte = less then or equal to
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter !== '') {
        query = query.gte('publishDate', req.query.publishedAfter) // gte = grater then or equal to
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
});

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
});

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('Cover image is required');
    }

    // Retrieve filename
    const fileName = file.filename;

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)
    } catch (error) {
        console.log(error);
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, true)
    }

});

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) {
            console.error(err);
        }
    })
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            params.errorMessage = 'Error Creating New Book'
        }
        res.render('books/new', params)
    } catch (error) {
        console.log(error);
        res.redirect('books')
    }
}

module.exports = router;
