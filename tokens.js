const Token = require('./models/token')

const tokens = {
    createToken(token){
        return Token.create(token)
    },
    readToken(tokenId){
        return Token.findOne({id: tokenId})
    }
}

module.exports = tokens