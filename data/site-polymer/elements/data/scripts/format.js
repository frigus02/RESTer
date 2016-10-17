(function () {

    const self = RESTer.register('format'),
          formatTime = new Intl.DateTimeFormat('en-US', {hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'});

    self.time = function (date) {
        return formatTime.format(new Date(date));
    };

})();
