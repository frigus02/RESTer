(function () {

    window.rester = window.rester || {};
    rester.data = rester.data || {};
    rester.data.environments = {};


    const db = rester.data.utils.db;

    /**
     * @typedef Environment
     * @type {Object}
     * @property {Number} id - Unique id of the environment.
     * @property {String} name - A name for this environment. Must only consist
     * of the letter A-Za-z0-9.
     * @property {Object} values - A object of key-value pairs, which may be used
     * as variables in requests.
     */
    rester.data.environments.Environment = Environment;
    function Environment(dbObject) {
        if (dbObject) {
            Object.assign(this, dbObject);
        } else {
            this.name = '';
            this.values = {};
        }
    }

    rester.data.environments.put = function (environment) {
        environment = new Environment(environment);
        return db.transaction(['environments'], 'readwrite', objectStores => {
            return db.putEntityAndUpdateId(objectStores[0], environment);
        });
    };

    rester.data.environments.get = function (id) {
        return db.transaction(['environments'], 'readonly', objectStores => {
            return db.getEntity(objectStores[0], id, Environment);
        });
    };

    rester.data.environments.query = function () {
        return db.transaction(['environments'], 'readonly', objectStores => {
            return db.getAllEntities(objectStores[0], null, Environment);
        });
    };

    rester.data.environments.delete = function (id) {
        const environment = new Environment();
        environment.id = id;

        return db.transaction(['environments'], 'readwrite', objectStores => {
            return db.deleteEntity(objectStores[0], environment);
        });
    };

})();
