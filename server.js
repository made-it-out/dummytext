const http = require("http");
const { StringDecoder } = require("string_decoder")
const handlers = require("./handlers")
const config = require("./config")
const helpers = require("./helpers")

// TODO move router to a different file
const router = {
    api: handlers.api,
    public: handlers.public,
    test: handlers.test,
    tokens: handlers.tokens
}

const server = http.createServer((req, res) => {
    // Get the requested url
    const reqUrl = new URL(req.url, config.base)

    // Get the path without leading or trailing slashes
    const trimmedPath = reqUrl.pathname.replace(/^\/+|\/+$/g, '');

    // Get the method
    const method = req.method.toLowerCase();

    // Get the headers
    const headers = req.headers;

    // Get the search parameters as an object
    const searchParams = Object.fromEntries(reqUrl.searchParams)

    // Get the payload, if there is one
    const decoder = new StringDecoder("utf-8");
    let buffer = '';

    req.on("data", (chunk) => {
        buffer += decoder.write(chunk)
    })

    req.on("end", () => {
        buffer += decoder.end()

        const payload = helpers.parseJSONToObject(buffer)

        // Data to be sent to handler
        const data = {
            trimmedPath,
            method,
            headers,
            searchParams,
            payload
        }

        // Check for static asset first
        handlers.public(data)
            .then(response => {
                const responsePayload = response.payload

                let payloadString = '';

                if (response.contentType === 'application/json') {
                    // Convert the payload to a JSON string
                    payloadString = JSON.stringify(responsePayload);
                }
                else {
                    payloadString = typeof (responsePayload) !== 'undefined' ? responsePayload : ''
                }

                // Return the response
                res.statusCode = response.statusCode;
                res.setHeader('Content-Type', response.contentType);
                res.end(payloadString);
            })
            // If the asset is not found, check for other handlers on the router, if the given path is not on the router, use the notFound handler
            .catch(errorResponse => {
                let chosenHandler = typeof (router[trimmedPath]) === 'function' ? router[trimmedPath] : handlers.notFound

                chosenHandler(data)
                    .then(response => {
                        const responsePayload = response.payload

                        let payloadString = '';

                        if (response.contentType === 'application/json') {
                            // Convert the payload to a JSON string
                            payloadString = JSON.stringify(responsePayload);
                        }
                        else {
                            payloadString = typeof (responsePayload) !== 'undefined' ? responsePayload : ''
                        }

                        // Return the response
                        res.statusCode = response.statusCode;
                        res.setHeader('Content-Type', response.contentType);
                        res.end(payloadString);
                    })
                    .catch(response => {
                        const responsePayload = response.payload

                        let payloadString = '';

                        if (response.contentType === 'application/json') {
                            // Convert the payload to a JSON string
                            payloadString = JSON.stringify(responsePayload);
                        }
                        else {
                            payloadString = typeof (responsePayload) !== 'undefined' ? responsePayload : ''
                        }

                        // Return the response
                        res.statusCode = response.statusCode;
                        res.setHeader('Content-Type', response.contentType);
                        res.end(payloadString);
                    })
            })
    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

