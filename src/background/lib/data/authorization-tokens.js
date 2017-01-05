(function () {

    window.rester = window.rester || {};
    rester.data = rester.data || {};
    rester.data.authorizationTokens = {};


    const db = rester.data.utils.db;

    /**
     * @typedef AuthorizationToken
     * @type {Object}
     * @property {Number} id - Unique id of the token.
     * @property {String} title - A human readable display name for the token.
     * @property {String} scheme - The authorization scheme like "Basic" or
     * "Bearer" as defined in https://tools.ietf.org/html/rfc2617.
     * @property {String} token - The actual access token.
     * @property {Date} expirationDate - An optional expiration date. The token
     * will automatically be removed from database, when it is expired.
     * @property {Number} providerId - The id of the token provider, which
     * generated this token.
     */
    rester.data.authorizationTokens.AuthorizationToken = AuthorizationToken;
    function AuthorizationToken(dbObject) {
        if (dbObject) {
            Object.assign(this, dbObject);
        } else {
            this.title = '';
            this.scheme = '';
            this.token = '';
            this.expirationDate = null;
            this.configurationId = 0;
            this.providerId = 0;
        }
    }

    rester.data.authorizationTokens.add = function (token) {
        token = new AuthorizationToken(token);

        return db.transaction().add('authTokens', token).execute();
    };

    rester.data.authorizationTokens.query = function () {
        return db.query('authTokens', AuthorizationToken);
    };

    rester.data.authorizationTokens.delete = function (id) {
        const token = new AuthorizationToken();
        token.id = id;

        return db.transaction().delete('authTokens', token).execute();
    };

})();
