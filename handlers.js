const categories = require("./categories")
const tokens = require("./tokens")
const fs = require("fs/promises")
const helpers = require("./helpers")
const config = require("./config")

// Handlers expect a data object and returns a promise with a status code and a json payload
const handlers = {
    notFound: function (data) {
        return new Promise((resolve, reject) => {
            reject({
                statusCode: 404,
                payload: { "Error": "Page Not Found" }
            })
        })
    },
    test: function (data) {
        return new Promise((resolve, reject) => {
            if (data.method === 'get') {
                resolve({
                    statusCode: 200,
                    payload: { "message": "success" }
                })
            }
            else {
                reject({
                    statusCode: 405,
                    payload: { "Error": "Request method not allowed" }
                })
            }
        })
    },
    api: function (data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                // Get category, default to random
                const category = data.searchParams.category.trim().length > 0 ? data.searchParams.category.trim() : 'random';
                // Get paragraphs, default to 1
                const numberOfParagraphs = parseInt(data.searchParams.paragraphs) > 0 ? data.searchParams.paragraphs : 1;

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
            else {
                reject({
                    statusCode: 405,
                    payload: { "Error": "Request method not allowed" }
                })
            }
        })
    },
    // Serve file from public directory
    public: function (data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                // Get the filename being requested
                // const trimmedAssetName = data.trimmedPath.replace('public', '');
                const publicDir = "./public"
                let contentType = 'text/plain'

                if (data.trimmedPath.length > 0) {
                    fs.readFile(`${publicDir}/${data.trimmedPath}`, "utf-8")
                        .then(content => {
                            if (data.trimmedPath.endsWith('.html')) {
                                contentType = 'text/html'
                            }
                            if (data.trimmedPath.endsWith('.css')) {
                                contentType = 'text/css'
                            }
                            if (data.trimmedPath.endsWith('.js')) {
                                contentType = 'application/javascript'
                            }
                            if (data.trimmedPath.endsWith('.png')) {
                                contentType = 'image/png'
                            }
                            if (data.trimmedPath.endsWith('.jpeg')) {
                                contentType = 'image/jpeg'
                            }
                            if (data.trimmedPath.endsWith('.ico')) {
                                contentType = 'image/x-icon'
                            }

                            resolve({
                                statusCode: 200,
                                contentType,
                                payload: content
                            })
                        })
                        .catch(error => reject({
                            statusCode: 404,
                            contentType: "application/json",
                            payload: { "Error": "Not Found" }
                        }))
                }
                else {
                    // Serve index.html if path.length is 0
                    fs.readFile(`${publicDir}/index.html`, "utf-8")
                        .then(content => {
                            resolve({
                                statusCode: 200,
                                contentType: "text/html",
                                payload: content
                            })
                        })
                        .catch(error => reject({
                            statusCode: 404,
                            contentType: "application/json",
                            payload: { "Error": "Not Found" }
                        }))
                }
            }
            else {
                reject({
                    statusCode: 405,
                    payload: { "Error": "Request method not allowed" }
                })
            }
        })
    },
    tokens: function (data) {
        const acceptableMethods = ['post'];
        // If an accepted method is given, send data to correct handler
        if (acceptableMethods.includes(data.method)) {
            return handlers._tokens[data.method](data)
        }
        else {
            return new Promise((resolve, reject) => reject({
                statusCode: 405,
                payload: { "Error": "Request method not allowed" }
            }))
        }
    },
    _tokens: {
        post: function (data) {
            return new Promise((resolve, reject) => {
                // Get password from request payload
                const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

                if (password === config.adminPassword) {
                    // If valid, create a new token with a random name.
                    const id = helpers.createRandomString(20);
                    // Set expiration date 1 hour in the future
                    const expires = Date.now() + 1000 * 60 * 60
                    const token = {
                        id,
                        expires
                    }

                    // Save the token
                    tokens.createToken(token)
                        .then(result => resolve({
                            statusCode: 201,
                            payload: token
                        }))
                        .catch(error => reject({
                            statusCode: 500,
                            payload: { "Error": "Could not create token" }
                        }))
                }
                else {
                    // If password does not match
                    reject({
                        statusCode: 401,
                        payload: { "Error": "Invalid password" }
                    })
                }
            })
        }
    },
    categories: function (data) {
        const acceptableMethods = ['post', 'get', 'put', 'delete'];
        // If an accepted method is given, send data to correct handler
        if (acceptableMethods.includes(data.method)) {
            return handlers._categories[data.method](data)
        }
        else {
            return new Promise((resolve, reject) => reject({
                statusCode: 405,
                payload: { "Error": "Request method not allowed" }
            }))
        }
    },
    _categories: {
        put: function (data) {
            return new Promise((resolve, reject) => {
                const category = data.payload.category
                const phrase = data.payload.phrase
                const method = data.payload.method

                // Check if adding or deleting phrase
                if (method === "add") {
                    categories.addPhrase(category, phrase)
                        .then(result => {
                            resolve({
                                statusCode: 200,
                                payload: result
                            })
                        })
                        .catch(error => {
                            reject({
                                statusCode: 404,
                                payload: { "Error": "Could not find category" }
                            })
                        })
                }
                else if (method === "delete") {
                    categories.removePhrase(category, phrase)
                        .then(result => {
                            resolve({
                                statusCode: 200,
                                payload: result
                            })
                        })
                        .catch(error => {
                            reject({
                                statusCode: 404,
                                payload: { "Error": "Could not find category" }
                            })
                        })
                }
                else {
                    // If no method is given
                    reject({
                        statusCode: 400,
                        contentType: "application/json",
                        payload: { "Error": "Must include method of \'add\' or \'delete\' in request body" }
                    })
                }
            })
        },
        get: function(data){
            return new Promise((resolve, reject) => {
                const category = data.payload.category;

                categories.readPhrases(category)
                .then(result => {
                    // Because the mongoose function for finding a document does not return an error if none is found, check here if the result of readPhrases is an array instead of the null response when a document is not found
                    if(result instanceof Array){
                        resolve({
                            statusCode: 200,
                            payload: result
                        })
                    }
                    else{
                        reject({
                            statusCode: 404,
                            payload: {"Error": `Category \'${category}\' not found`}
                        })
                    }
                })
                .catch(error => reject({
                    statusCode: 400,
                    payload: error
                }))
            })
        },
        post: function(data){
            return new Promise((resolve, reject) => {
                const category = data.payload.category

                categories.createCategory(category)
                .then(result => {
                    // If createCategory returns an Error message (meaning a category already exists), return a 400 status code
                    if(result["Error"]){
                        resolve({
                            statusCode: 400,
                            payload: result
                        })
                    }
                    else{
                        resolve({
                            statusCode: 201,
                            payload: result
                        })
                    }
                })
                .catch(error => reject({
                    statusCode: 500,
                    payload: error
                }))
            })
        },
        delete: function(data){
            return new Promise((resolve, reject) => {
                const category = data.payload.category

                categories.removeCategory(category)
                .then(result => {
                    // If removeCategory returns an Error message (meaning a category does not exists), return a 400 status code
                    if(result["Error"]){
                        resolve({
                            statusCode: 400,
                            payload: result
                        })
                    }
                    else{
                        resolve({
                            statusCode: 200,
                            payload: result
                        })
                    }
                })
                .catch(error => reject({
                    statusCode: 500,
                    payload: error
                }))
            })
        }
    }
}

module.exports = handlers