/**
 * test
 * @author jero
 * @date 2016-09-06
 */

var path = require('path');
var fis = require('fis3');
var expect = require('chai').expect;
var _release = fis.require('command-release/lib/release.js');
var _deploy = fis.require('command-release/lib/deploy.js');
var self = require('../');

function release(opts, cb) {
  opts = opts || {};
  cb = cb || function() {};

  _release(opts, function(err, info) {
    _deploy(info, cb);
  });
}


describe('postprocessor postcss', function() {
  var root = path.join(__dirname, 'src');

  fis.project.setProjectRoot(root);

  beforeEach(function() {
    var dev = path.join(__dirname, 'dev');

    fis.match('*.scss', {
      rExt: 'css',
      parser: fis.plugin('node-sass', {
        sourceMap: true
      })
    });

    self.options = {
      autoprefixer: {
        browsers: ['last 40 version']
      },
      sourceMapRelative: true
      // sourceMap: false
    };

    fis.match('*', {
      postprocessor: self,

      deploy: fis.plugin('local-deliver', {
        to: dev
      })
    });
  });


  it('postcss', function(done) {
    fis.on('release:end', function(ret) {
      var src = ret.src;
      var sassFile = src['/sass.scss'];
      var apFile = src['/autoprefix.css'];
      var nextFile = src['/cssnext.css'];
      var sassFileContent = sassFile.getContent();

      // expect(sassFile.derived.length).to.eq(1);
      // expect(sassFile.derived[0].ext).to.eq('.map'); // 必须有 map 文件
      // expect(sassFileContent).to.contain('sourceMappingURL');

      done();
    });

    release({
      unique: true
    }, function() {

      console.log('release complete');
    });
  });
});
