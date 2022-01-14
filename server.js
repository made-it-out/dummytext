const http = require("http");
const { StringDecoder } = require("string_decoder")
// const url = require("url")
const base = "http://localhost:5000"
const handlers = require("./handlers")

// TODO move router to a different file
const router = {
    'test': handlers.test,
    '': handlers.index
}

const server = http.createServer((req, res) => {
    // Get the requested url
    const reqUrl = new URL(req.url, base)

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

        const payload = JSON.parse(buffer);

        // Choose the handler this request should go to. If one is not found, use notFound handler
        let chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        // Data to be sent to handler
        const data = {
            trimmedPath,
            method,
            headers,
            searchParams,
            payload
        }

        chosenHandler(data, function (statusCode, responsePayload) {
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200
            res.statusCode = statusCode;

            // Set content type to json
            res.setHeader('Content-Type', 'application/json');

            // Use the payload called back by the handler, or default to an empty object
            responsePayload = typeof (responsePayload) == 'object' ? responsePayload : {};

            // Convert the payload to a JSON string
            payloadString = JSON.stringify(responsePayload);

            // Return the response
            res.end(payloadString);
        })

    })
})

server.listen(5000, () => {
    console.log("Server running");
})

