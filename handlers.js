const categories = require("./categories")

// Handlers expect a data object and a callback function that returns a status code and a json payload
const handlers = {
    // tokens: function(data, callback){}
    test: function (data, callback) {
        callback(200, { "message": "success" })
    },
    index: function (data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                // Get category, default to random
                const category = typeof (data.searchParams.category) === 'string' ? data.searchParams.category : 'random';
                // Get paragraphs, default to 5
                const numberOfParagraphs = typeof (data.searchParams.paragraphs) === 'number' && data.searchParams.paragraphs > 0 ? data.searchParams.paragraphs : 5;

                categories.createParagraphs(category, numberOfParagraphs)
                    // return paragraphs
                    .then(paragraphs => resolve({
                        statusCode: 200,
                        payload: { paragraphs }
                    }))
                    .catch(error => reject({
                        statusCode: 404,
                        payload: { "Error": "Category not found" }
                    }))
            }
            else{
                reject({
                    statusCode: 405,
                    payload: {"Error": "Request method not allowed"}
                })
            }
        })


    }
}

module.exports = handlers