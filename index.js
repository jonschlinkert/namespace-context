/*!
 * namespace-context <https://github.com/jonschlinkert/namespace-context>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isBuffer = require('is-buffer');
var clone = require('clone-deep');

module.exports = function (app, namespace, customFn) {
  if (typeof namespace === 'function') {
    customFn = namespace;
    namespace = null;
  }

  // use custom function from args, or `app.context`, or noop
  var fn =  customFn || app.context || identity;

  // replace the built-in context method
  app.context = function (view/*, context, locals*/) {
    var opts = view.options || {};
    var name = namespace || opts.inflection || 'page';

    var ctx = fn.apply(app, arguments) || {};
    ctx[name] = clone(ctx, function (value) {
      if (isBuffer(value)) return value.slice();
    });
    return ctx;
  };
  return app;
};

/**
 * Return the value passed to the function
 */

function identity(data) {
  return data;
}
