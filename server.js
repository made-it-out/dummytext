const http = require("http");
const { StringDecoder } = require("string_decoder")
const handlers = require("./handlers")
const config = require("./config")
const helpers = require("./helpers")

// TODO move router to a different file
const router = {
    '': handlers.index,
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
            res.statusCode = response.statusCode;
            responsePayload = response.payload

            // Set content type to json
            res.setHeader('Content-Type', 'application/json');

            // Convert the payload to a JSON string
            payloadString = JSON.stringify(responsePayload);

            // Return the response
            res.end(payloadString);
        })
        .catch(errorResponse => {
            res.statusCode = errorResponse.statusCode;
            responsePayload = errorResponse.payload

            // Set content type to json
            res.setHeader('Content-Type', 'application/json');

            // Convert the payload to a JSON string
            payloadString = JSON.stringify(responsePayload);

            // Return the response
            res.end(payloadString);
        })
    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

