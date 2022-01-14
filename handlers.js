const categories = require("./categories")

// Handlers expect a data object and a callback function that returns a status code and a json payload
const handlers = {
    // tokens: function(data, callback){}
    test: function(data, callback){
        callback(200, {"message": "success"})
    },
    index: function(data, callback){
        // Get category, default to random
        const category = typeof(data.searchParams.category) === 'string' ? data.searchParams.category : 'random';
        // Get paragraphs, default to 5
        const numberOfParagraphs = typeof(data.searchParams.paragraphs) === 'number' && data.searchParams.paragraphs > 0 ? data.searchParams.paragraphs : 5;

        categories.createParagraphs(category, numberOfParagraphs)
        .then(paragraphs => callback(200, {paragraphs}))
        .catch(error => callback(404, {"Error": "Category not found"}))
    }
}

module.exports = handlers