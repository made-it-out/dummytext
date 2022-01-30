const categories = require("./categories")
const tokens = require("./tokens")
const fs = require("fs/promises")
const helpers = require("./helpers")
const config = require("./config")
const pagesDir = './pages'

// Handlers expect a data object and returns a promise with a status code and a json payload
const handlers = {
    index(data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                fs.readFile(`${pagesDir}/index.html`, "utf-8")
                    .then(content => resolve({
                        statusCode: 200,
                        contentType: "text/html",
                        payload: content
                    }))
                    .catch(error => reject({
                        statusCode: 500,
                        payload: { error: "Server error" }
                    }))
            }
            else {
                reject({
                    statusCode: 405,
                    payload: { error: "Request method not allowed" }
                })
            }
        })
    },
    login(data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                fs.readFile(`${pagesDir}/login.html`, "utf-8")
                    .then(content => resolve({
                        statusCode: 200,
                        contentType: "text/html",
                        payload: content
                    }))
                    .catch(error => reject({
                        statusCode: 500,
                        payload: { error: "Server error" }
                    }))
            }
            else {
                reject({
                    statusCode: 405,
                    payload: { error: "Request method not allowed" }
                })
            }
        })
    },
    categories(data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                // Verify token before showing categories
                const tokenId = helpers.getSessionToken(data)

                return handlers._tokens.verifyToken(tokenId)
                    // If token is verified
                    .then(result => fs.readFile(`${pagesDir}/categories.html`, "utf-8")
                        .then(content => resolve({
                            statusCode: 200,
                            contentType: "text/html",
                            payload: content
                        }))
                        // Nested catch if error reading file
                        .catch(error => reject({
                            statusCode: 500,
                            payload: { error: "Server error" }
                        })))
                    // If token cannot be verified, serve the login page
                    .catch(error => {
                        handlers.login(data).then(result => reject(result));
                    })
            }
            else {
                reject({
                    statusCode: 405,
                    payload: { error: "Request method not allowed" }
                })
            }
        })
    },
    docs(data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                fs.readFile(`${pagesDir}/docs.html`, "utf-8")
                    .then(content => resolve({
                        statusCode: 200,
                        contentType: "text/html",
                        payload: content
                    }))
                    .catch(error => reject({
                        statusCode: 500,
                        payload: { error: "Server error" }
                    }))
            }
            else {
                reject({
                    statusCode: 405,
                    payload: { error: "Request method not allowed" }
                })
            }
        })
    },
    notFound(data) {
        return new Promise((resolve, reject) => {
            reject({
                statusCode: 404,
                payload: { error: "Page Not Found" }
            })
        })
    },
    api(data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                // Get category, default to mixed
                const category = typeof (data.searchParams.category) === 'string' && data.searchParams.category.trim().length > 0 ? data.searchParams.category.trim() : 'mixed';
                // Get paragraphs, default to 1
                const numberOfParagraphs = typeof (data.searchParams.paragraphs) === 'string' && parseInt(data.searchParams.paragraphs) > 0 && parseInt(data.searchParams.paragraphs) <= 20 ? parseInt(data.searchParams.paragraphs) : 1;

                categories.createParagraphs(category, numberOfParagraphs)
                    // return paragraphs
                    .then(paragraphs => resolve({
                        statusCode: 200,
                        payload: { paragraphs }
                    }))
                    .catch(error => reject({
                        statusCode: 404,
                        payload: { error: "Category not found" }
                    })
                    )
            }
            else {
                reject({
                    statusCode: 405,
                    payload: { error: "Request method not allowed" }
                })
            }
        })
    },
    // Serve file from public directory
    public(data) {
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
                            payload: { error: "Not Found" }
                        }))
                }
                else {
                    reject({
                        statusCode: 404,
                        payload: { error: "Not Found" }
                    })
                }
            }
            else {
                reject({
                    statusCode: 405,
                    payload: { error: "Request method not allowed" }
                })
            }
        })
    },
    'api/tokens'(data) {
        const acceptableMethods = ['post'];
        // If an accepted method is given, send data to correct handler
        if (acceptableMethods.includes(data.method)) {
            return handlers._tokens[data.method](data)
        }
        else {
            return new Promise((resolve, reject) => reject({
                statusCode: 405,
                payload: { error: "Request method not allowed" }
            }))
        }
    },
    _tokens: {
        post(data) {
            return new Promise((resolve, reject) => {
                // Get username from request - should be an empty string
                const username = typeof (data.payload.username) === 'string' && data.payload.username.trim().length > 0 ? data.payload.username.trim() : false

                if (username) {
                    // Username should not be filled out
                    reject({
                        statusCode: 401,
                        payload: { error: "Invalid username or password" }
                    })
                    return
                }

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
                            payload: { error: "Could not create token" }
                        }))
                }
                else {
                    // If password does not match
                    reject({
                        statusCode: 401,
                        payload: { error: "Invalid username or password" }
                    })
                }
            })
        },
        verifyToken(tokenId) {
            return new Promise((resolve, reject) => {
                tokens.readToken(tokenId)
                    .then(result => {
                        // If token is valid
                        if (result.expires > Date.now()) {
                            resolve(true)
                        }
                        // If token is expired
                        else {
                            reject({
                                statusCode: 401,
                                payload: { error: "Unauthorized" }
                            })
                        }
                    })
                    .catch(error => {
                        // If token is not found
                        reject({
                            statusCode: 401,
                            payload: { error: "Unauthorized" }
                        })
                    })
            })
        }
    },
    'api/categories'(data) {
        const acceptableMethods = ['post', 'get', 'put', 'delete'];
        // If an accepted method is given, send data to correct handler
        if (acceptableMethods.includes(data.method)) {
            const tokenId = helpers.getSessionToken(data)

            // Verify the token sent in the header before continuing
            return handlers._tokens.verifyToken(tokenId)
                // If token is verified
                .then(result => handlers._categories[data.method](data))
                // If token cannot be verified or error in other handlers
                .catch(error => error)
        }
        else {
            return new Promise((resolve, reject) => reject({
                statusCode: 405,
                payload: { error: "Request method not allowed" }
            }))
        }
    },
    _categories: {
        put(data) {
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
                                payload: { error: "Could not find category" }
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
                                payload: { error: "Could not find category" }
                            })
                        })
                }
                else {
                    // If no method is given
                    reject({
                        statusCode: 400,
                        payload: { error: "Must include method of \'add\' or \'delete\' in request body" }
                    })
                }
            })
        },
        get(data) {
            return new Promise((resolve, reject) => {
                // Get category, default to mixed
                const category = typeof (data.searchParams.category) === 'string' && data.searchParams.category.trim().length > 0 ? data.searchParams.category.trim() : 'mixed';

                categories.readPhrases(category)
                    .then(result => {
                        // Because the mongoose function for finding a document does not return an error if none is found, check here if the result of readPhrases is an array instead of the null response when a document is not found
                        if (result instanceof Array) {
                            resolve({
                                statusCode: 200,
                                payload: result
                            })
                        }
                        else {
                            reject({
                                statusCode: 404,
                                payload: { error: `Category \'${category}\' not found` }
                            })
                        }
                    })
                    .catch(error => reject({
                        statusCode: 400,
                        payload: error
                    }))
            })
        },
        post(data) {
            return new Promise((resolve, reject) => {
                const category = data.payload.category

                categories.createCategory(category)
                    .then(result => {
                        // If createCategory returns an error message (meaning a category already exists), return a 400 status code
                        if (result[error]) {
                            resolve({
                                statusCode: 400,
                                payload: result
                            })
                        }
                        else {
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
        delete(data) {
            return new Promise((resolve, reject) => {
                const category = data.payload.category

                categories.removeCategory(category)
                    .then(result => {
                        // If removeCategory returns an error message (meaning a category does not exists), return a 400 status code
                        if (result[error]) {
                            resolve({
                                statusCode: 400,
                                payload: result
                            })
                        }
                        else {
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
    },
    // Get all the categories to serve to form on homepage
    'api/categories/all'(data) {
        return new Promise((resolve, reject) => {
            // Only accept GET request
            if (data.method === 'get') {
                categories.getCategories()
                    .then(result => resolve({
                        statusCode: 200,
                        payload: result
                    }))
                    .catch(error => reject({
                        statusCode: 500,
                        payload: { error: "Server error finding categories" }
                    }))
            }
            else {
                reject({
                    statusCode: 405,
                    payload: { error: "Request method not allowed" }
                })
            }
        })
    }
}

module.exports = handlers