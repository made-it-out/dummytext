const http = require("http");
const { StringDecoder } = require("string_decoder")
const handlers = require("./handlers")
const config = require("./config")
const helpers = require("./helpers")

// TODO move router to a different file
const router = {
    api: handlers.api,
    public: handlers.public,
    test: handlers.test
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

        // Choose the handler this request should go to. If one is not found, use notFound handler
        let chosenHandler = typeof (router[trimmedPath]) === 'function' ? router[trimmedPath] : handlers.notFound

        // If the request is within the public directory, use the public handler instead
        chosenHandler = trimmedPath.startsWith('public') ? handlers.public : chosenHandler

        // Data to be sent to handler
        const data = {
            trimmedPath,
            method,
            headers,
            searchParams,
            payload
        }

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
            .catch(errorResponse => {
                // Error responses only return json
                const responsePayload = errorResponse.payload

                // Convert the payload to a JSON string
                payloadString = JSON.stringify(responsePayload);

                // Return the response
                res.statusCode = errorResponse.statusCode;
                res.setHeader('Content-Type', errorResponse.contentType);
                res.end(payloadString);
            })
    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

