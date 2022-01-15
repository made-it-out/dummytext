const categories = require("./categories")

// Handlers expect a data object and returns a promise with a status code and a json payload
const handlers = {
    notFound: function(data){
        return new Promise((resolve, reject) => {
            reject({
                statusCode: 404,
                payload: {"Error": "Page Not Found"}
            })
        })
    },
    test: function(data){
        return new Promise((resolve,reject) => {
            if(data.method === 'get'){
                resolve({
                    statusCode: 200,
                    payload: {"message": "success"}
                })
            }
            else{
                reject({
                    statusCode: 405,
                    payload: {"Error": "Request method not allowed"}
                })
            }
        })
    },
    index: function (data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                // Get category, default to random
                const category = typeof (data.searchParams.category) === 'string' ? data.searchParams.category : 'random';
                // Get paragraphs, default to 1
                const numberOfParagraphs = parseInt(data.searchParams.paragraphs) > 0 ? data.searchParams.paragraphs : 1;

                // console.log(typeof(data.searchParams.paragraphs))
                // console.log(data.searchParams.paragraphs)

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