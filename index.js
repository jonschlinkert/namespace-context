/*!
 * namespace-context <https://github.com/jonschlinkert/namespace-context>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var merge = require('mixin-deep');

module.exports = function(namespace, contextFn) {
  if (typeof namespace === 'function') {
    contextFn = namespace;
    namespace = null;
  }

  return function plugin(view) {
    if (!this.isView && !this.isItem) return plugin;

    var opts = this.options || {};
    var name = namespace || opts.inflection || 'page';
    var fn = contextFn || this.context;

    this.define('context', function(locals) {
      var ctx = fn.apply(this, arguments) || {};
      ctx[name] = merge({}, ctx, this.data);
      return ctx;
    });

    return plugin;
  };
};
