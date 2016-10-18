(function () {

    const self = RESTer.register('format'),
          formatTime = new Intl.DateTimeFormat(undefined, {hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'}),
          formatDateTime = new Intl.DateTimeFormat(undefined, {year: 'numeric', month: '2-digit', day: '2-digit', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'});

    self.time = function (date) {
        return formatTime.format(new Date(date));
    };

    self.dateTime = function (date) {
        return formatDateTime.format(new Date(date));
    };

})();
