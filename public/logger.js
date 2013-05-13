var ExceptionLogger = function() {

    var onsuccess;
    var onfailure;

    var data = {
        "info": "Unknown Exception."
    };

    var parameters = {
        "url": "/add",
        "type": "POST",
        "data": data,
        "success": success,
        "error": failure
    };

    var fakeURL = 'http://sohu.inc/#!/intro';

    function success(res, status, xhr) {
        console.log(res, status, xhr);

        (typeof onsuccess === 'function') && onsuccess(res, status, xhr);
    };

    function failure(xhr, status, error) {
        console.log(xhr, status, error);

        (typeof onfailure === 'function') && onfailure(res, status, xhr);
    };

    function processDate(stamp) {
        var date, year, month, day, hours, minutes, seconds;

        date    = new Date(stamp);
        year    = date.getFullYear();
        month   = date.getMonth() + 1;
        day     = date.getDate();
        hours   = date.getHours();
        minutes = date.getMinutes();
        seconds = date.getSeconds();

        return year + '-' + prefix(month) + '-' + prefix(day) + ' ' + prefix(hours) + ':' + prefix(minutes) + ':' + prefix(seconds);

        function prefix(n) {
            return n < 10 ? '0' + n : n;
        }
    };

    function sendExceptionRequest(e) {
        var i, info, infoArray;

        info = {
            "type": e.type || "Unknown Type",
            "filename": e.filename || "Unknown File",
            "lineno": e.lineno || 0,
            "message": e.message || "Unknown Error",
            "timeStamp": processDate(e.timeStamp || new Date)
        };

        infoArray = [];
        for (i in info) {
            if (info.hasOwnProperty(i)) {
                infoArray.push(i + '=' + info[i]);
            }
        }


        parameters.data.info = infoArray.join('&');

        $.ajax(parameters);
    }
    
    function onAjaxErrorHandler(event, jqxhr, settings, exception) {
        console.log(event, jqxhr, settings, exception);

        // Send log request.
        (event.type === 'ajaxError') && sendExceptionRequest(event);
    }

    function init(config) {
        if (config) {
            onsuccess = config.success;
            onfailure = config.failure;
        }

        // On window error listener.
        window.addEventListener('error', sendExceptionRequest, false);

        // Trigger `ajaxError` events if using jQuery
        $(document).on('ajaxError', onAjaxErrorHandler);
    }

    // Error type:
    //new Error();

    // EvalError
    // RangeError
    // ReferenceError
    // SyntaxError
    // TypeError
    // URIError

    // An error
    // throw 'Absolutely an error!';

    // Ajax error
    // $(document).ajaxError(errorHandler);
    // $.ajax(fakeURL);

    // Undefined is not a function
    // undef();

    // (new Image).src = 'http://sohu.inc/#!/intro';

    return {
        "init": init
    };
}();
