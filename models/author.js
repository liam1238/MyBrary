const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        const author = this;
        const books = await Book.find({ author: author._id });
        if (books.length > 0) {
            throw new Error('This author has books still');
        }
        next();
    } catch (err) {
        next(err);
    }
});


module.exports = mongoose.model('Author', authorSchema)