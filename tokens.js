const fs = require("fs/promises");
const tokensDir = "./data/tokens"

const tokens = {
    createToken: function(token){
        return fs.writeFile(`${tokensDir}/${token.id}.json`, JSON.stringify(token), 'utf-8')
    },
    readToken: function(tokenId){
        return fs.readFile(`${tokensDir}/${tokenId}.json`, 'utf-8')
    }
}

module.exports = tokens