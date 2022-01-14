const environments = {
    testing: {
        envName: 'testing',
        hashingSecret: 'thisIsASecret'
    }
}

// Determine which environment was passed as a command line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.testing

module.exports = environmentToExport