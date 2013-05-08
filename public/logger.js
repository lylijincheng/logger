function ExceptionLogger() {
  this.init.apply(this, arguments);
}

ExceptionLogger.prototype = {
  constructor: this,

  init: function() {
    console.log('init arguments: ', arguments);
  }
}