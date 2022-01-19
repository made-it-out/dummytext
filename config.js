require('dotenv').config()

const environments = {
    testing: {
        name: 'testing',
        adminPassword: process.env.ADMIN_PASSWORD,
        base: "http://localhost:5000",
        port: 5000,
        dbUri: process.env.DB_URI
    },
    production: {
        name: 'production',
        adminPassword: process.env.ADMIN_PASSWORD,
        base: "https://dummytext.herokuapp.com",
        port: process.env.PORT,
        dbUri: process.env.DB_URI
    }
}

// Determine which environment was passed as a command line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.testing

module.exports = environmentToExport