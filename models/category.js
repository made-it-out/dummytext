const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phrases: {
        type: Array,
        required: true
    }
})

const Category = mongoose.model('Category', categorySchema, 'categories')
module.exports = Category