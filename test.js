/* deps: mocha */
var assert = require('assert');
var should = require('should');
var mixin = require('mixin-deep');
var async = require('async');
var namespace = require('./');
var App = require('templates');
var app;

describe('namespace', function () {
  beforeEach(function () {
    app = new App();
    app.engine('md', require('engine-handlebars'));
    app.create('page');
  });

  it('should add the specified namespace:', function (done) {
    namespace(app, 'page');
    app.page('abc.md', {content: '{{page.title}}', locals: {title: 'Page Title'}});

    app.pages.getView('abc.md')
      .render(function (err, res) {
        if (err) return done(err);
        assert(res.contents.toString().trim() === 'Page Title');
        done();
      });
  });

  it('should automatically add the namespace based on view type:', function (done) {
    // `page` is already created by assemble, let's create two more:
    app.create('post');
    app.create('doc');

    // "auto"-namespace
    namespace(app);

    // add templates
    app.page('abc.md', {content: '{{page.title}}', locals: {title: 'Page Title'}});
    app.page('xyz.md', {content: '{{title}}', locals: {title: 'Page Title'}});
    app.post('def.md', {content: '{{post.title}}', locals: {title: 'Post Title'}});
    app.doc('ghi.md', {content: '{{doc.title}}', locals: {title: 'Docs Title'}});

    async.parallel([
      function (next) {
        app.pages.getView('abc.md')
          .render(function (err, res) {
            if (err) return next(err);
            assert(res.contents.toString().trim() === 'Page Title');
            next();
          });
      },
      function (next) {
        app.pages.getView('xyz.md')
          .render(function (err, res) {
            if (err) return next(err);
            assert(res.contents.toString().trim() === 'Page Title');
            next();
          });
      },
      function (next) {
        app.posts.getView('def.md')
          .render(function (err, res) {
            if (err) return next(err);
            assert(res.contents.toString().trim() === 'Post Title');
            next();
          });
      },
      function (next) {
        app.docs.getView('ghi.md')
          .render(function (err, res) {
            if (err) return next(err);
            assert(res.contents.toString().trim() === 'Docs Title');
            next();
          });
      }
    ], function (err) {
      if (err) return done(err);
      done();
    });
  });

  it('should support passing a custom context function:', function (done) {
    namespace(app, 'page', function (view, options, locals) {
      return locals;
    });

    app.page('abc.md', {content: '{{page.title}}', locals: {title: 'AAA'}})
      .render({title: 'Blah'}, function (err, res) {
        if (err) return done(err);
        assert(res.contents.toString().trim() === 'Blah');
        done();
      });
  });
});
