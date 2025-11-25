module.exports = {
    // Called before each request is sent
    beforeRequest: function (requestParams, context, ee, next) {
        // You can add custom headers, modify the URL, etc.
        // Example: console.log(`[VU ${context.vars.vu}] Requesting ${requestParams.url}`);
        return next();
    },

    // Called after each response is received
    afterResponse: function (requestParams, response, context, ee, next) {
        // Example: console.log(`[VU ${context.vars.vu}] Received ${response.statusCode}`);
        return next();
    }
};
