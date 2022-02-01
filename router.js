const handlers = require("./handlers")

const router = {
    notFound: handlers.notFound,
    api: handlers.api,
    public: handlers.public,
    '': handlers.index,
    login: handlers.login,
    categories: handlers.categories,
    docs: handlers.docs,
    'api/tokens': handlers['api/tokens'],
    'api/categories': handlers['api/categories'],
    'api/categories/all': handlers['api/categories/all']
}

module.exports = router