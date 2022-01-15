const categories = require("./categories")
const fs = require("fs/promises")

// Handlers expect a data object and returns a promise with a status code and a json payload
const handlers = {
    notFound: function (data) {
        return new Promise((resolve, reject) => {
            reject({
                statusCode: 404,
                contentType: "application/json",
                payload: { "Error": "Page Not Found" }
            })
        })
    },
    test: function (data) {
        return new Promise((resolve, reject) => {
            if (data.method === 'get') {
                resolve({
                    statusCode: 200,
                    contentType: "application/json",
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
                const category = typeof (data.searchParams.category) === 'string' ? data.searchParams.category : 'random';
                // Get paragraphs, default to 1
                const numberOfParagraphs = parseInt(data.searchParams.paragraphs) > 0 ? data.searchParams.paragraphs : 1;

                categories.createParagraphs(category, numberOfParagraphs)
                    // return paragraphs
                    .then(paragraphs => resolve({
                        statusCode: 200,
                        contentType: "application/json",
                        payload: { paragraphs }
                    }))
                    .catch(error => reject({
                        statusCode: 404,
                        contentType: "application/json",
                        payload: { "Error": "Category not found" }
                    }))
            }
            else {
                reject({
                    statusCode: 405,
                    contentType: "application/json",
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
                const trimmedAssetName = data.trimmedPath.replace('public', '');
                const publicDir = "./public"
                let contentType = 'text/plain'

                if (trimmedAssetName.length > 0) {
                    fs.readFile(`${publicDir}${trimmedAssetName}`, "utf-8")
                        .then(content => {
                            if (trimmedAssetName.endsWith('.html')) {
                                contentType = 'text/html'
                            }
                            if (trimmedAssetName.endsWith('.css')) {
                                contentType = 'text/css'
                            }
                            if (trimmedAssetName.endsWith('.js')) {
                                contentType = 'application/javascript'
                            }
                            if (trimmedAssetName.endsWith('.png')) {
                                contentType = 'image/png'
                            }
                            if (trimmedAssetName.endsWith('.jpeg')) {
                                contentType = 'image/jpeg'
                            }
                            if (trimmedAssetName.endsWith('.ico')) {
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
                            payload: {"Error": "Not Found"}
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
                    contentType: "application/json",
                    payload: { "Error": "Request method not allowed" }
                })
            }
        })
    }
}

module.exports = handlers