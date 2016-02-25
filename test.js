'use strict';

require('mocha');
var assert = require('assert');
var async = require('async');
var matter = require('parser-front-matter');
var namespace = require('./');
var App = require('templates');
var app;

describe('namespace', function() {
  beforeEach(function() {
    app = new App();
    app.engine('md', require('engine-handlebars'));
  });

  it('should add the specified namespace:', function(cb) {
    app.use(namespace('page'));
    app.create('page');

    app.page('abc.md', {content: 'a {{page.title}} b', locals: {title: 'Page Title'}})
      .render(function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content.trim(), 'a Page Title b');
        cb();
      });
  });

  it('should work as an app plugin after a collection has already been created', function(cb) {
    app.create('page');

    app.use(namespace('page'));

    app.page('abc.md', {content: 'a {{page.title}} b', locals: {title: 'Page Title'}})
      .render(function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content.trim(), 'a Page Title b');
        cb();
      });
  });

  it('should work as a collection plugin after a collection has already been created', function(cb) {
    app.create('page');
    app.pages.use(namespace('page'));

    app.page('abc.md', {content: 'a {{page.title}} b', locals: {title: 'Page Title'}})
      .render(function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content.trim(), 'a Page Title b');
        cb();
      });
  });

  it('should prefer data from front-matter', function(cb) {
    app.use(namespace('page'));
    app.create('page');

    app.onLoad(/./, function(view, next) {
      matter.parse(view, next);
    });

    app.page('abc.md', {content: '---\ntitle: Front Matter\n---\na {{page.title}} b', locals: {title: 'Page Title'}})
      .render(function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content.trim(), 'a Front Matter b');
        cb();
      });
  });

  it('should prefer view data over app data', function(cb) {
    app.use(namespace('page'));
    app.create('page');

    app.data({title: 'Site Title'});

    app.onLoad(/./, function(view, next) {
      matter.parse(view, next);
    });

    app.page('abc.md', {content: '---\ntitle: Front Matter\n---\na {{page.title}} b', locals: {title: 'Page Title'}})
      .render(function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content.trim(), 'a Front Matter b');
        cb();
      });
  });

  it('should automatically add the namespace based on view type:', function(cb) {
    // 'auto'-namespace
    app.use(namespace());

    app.create('pages');
    app.create('posts');
    app.create('docs');

    // add templates
    app.page('abc.md', {content: '{{page.title}}', locals: {title: 'Page Title'}});
    app.page('xyz.md', {content: '{{title}}', locals: {title: 'Page Title'}});
    app.post('def.md', {content: '{{post.title}}', locals: {title: 'Post Title'}});
    app.doc('ghi.md', {content: '{{doc.title}}', locals: {title: 'Docs Title'}});

    async.parallel([
      function(next) {
        app.pages.getView('abc.md')
          .render(function(err, res) {
            if (err) return next(err);
            assert.equal(res.content.trim(), 'Page Title');
            next();
          });
      },
      function(next) {
        app.pages.getView('xyz.md')
          .render(function(err, res) {
            if (err) return next(err);
            assert.equal(res.content.trim(), 'Page Title');
            next();
          });
      },
      function(next) {
        app.posts.getView('def.md')
          .render(function(err, res) {
            if (err) return next(err);
            assert.equal(res.content.trim(), 'Post Title');
            next();
          });
      },
      function(next) {
        app.docs.getView('ghi.md')
          .render(function(err, res) {
            if (err) return next(err);
            assert.equal(res.content.trim(), 'Docs Title');
            next();
          });
      }
    ], function(err) {
      if (err) return cb(err);
      cb();
    });
  });

  it('should support passing a custom context function:', function(cb) {
    var count = 0;
    app.use(namespace('page', function custom(locals) {
      locals = locals || {};
      locals.title = 'Custom';
      count++;
      return locals;
    }));

    app.create('page');

    app.page('abc.md', {content: 'a {{page.title}} b', locals: {title: 'AAA'}})
      .render({title: 'Blah'}, function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content.trim(), 'a Custom b');
        assert(count >= 1);
        cb();
      });
  });
});
