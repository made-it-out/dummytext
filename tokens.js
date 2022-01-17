const fs = require("fs/promises");
const tokensDir = "./data/tokens"
const helpers = require("./helpers")

const tokens = {
    createToken: function(token){
        return fs.writeFile(`${tokensDir}/${token.id}.json`, JSON.stringify(token), 'utf-8')
    }
}

module.exports = tokens