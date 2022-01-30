const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokenSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    expires: {
        type: Number,
        required: true
    }
})

const Token = mongoose.model('Token', tokenSchema, 'tokens')
module.exports = Token