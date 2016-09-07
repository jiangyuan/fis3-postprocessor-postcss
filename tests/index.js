/**
 * unit test
 * @author jero
 * @date 2016-09-06
 */

var path = require('path');
var fis = require('fis3');
var autoprefixer = require('autoprefixer');
var cssnext = require('postcss-cssnext');
var expect = require('chai').expect;
var _release = fis.require('command-release/lib/release.js');
var _deploy = fis.require('command-release/lib/deploy.js');
var self = require('../');

function release(opts) {
  return new Promise(function (resolve) {
    opts = opts || {
      unique: true
    };

    _release(opts, function (err, info) {
      _deploy(info, function () {
        resolve();
      });
    });
  });
}

describe('postprocessor postcss', function () {
  var root = path.join(__dirname, 'src');

  fis.project.setProjectRoot(root);

  beforeEach(function () {
    var dev = path.join(__dirname, 'dev');

    fis.match('*.scss', {
      rExt: 'css',
      parser: fis.plugin('node-sass', {
        sourceMap: true
      })
    });

    fis.match('*', {
      deploy: fis.plugin('local-deliver', {
        to: dev
      })
    });
  });


  it('autoprefixer', function (done) {
    self.options = {
      autoprefixer: {
        browsers: ['last 40 version']
      },
      sourceMapRelative: true
      // sourceMap: false
    };

    fis.match('sass-autoprefixer.scss', {
      postprocessor: self
    });

    fis.on('release:end', function (ret) {
      var src = ret.src;
      var sassFile = src['/sass-autoprefixer.scss'];
      var sassFileContent = sassFile.getContent();
      expect(sassFile.derived.length).to.eq(1);
      expect(sassFile.derived[0].ext).to.eq('.map'); // 必须有 map 文件
      expect(sassFileContent).to.contain('sourceMappingURL');
      expect(sassFileContent).to.contain('-webkit-linear'); // 添加前缀
    });

    release().then(done);
  });

  it('自定义 plugins -- cssnext', function (done) {
    self.options = {
      sourceMapRelative: true,
      plugins: [
        cssnext({
          browsers: ['last 40 version'] // cssnext 内置 autoprefixer
        })
      ]
    };

    fis.match('cssnext.css', {
      postprocessor: self
    });

    fis.on('release:end', function (ret) {
      var src = ret.src;
      var sassFile = src['/sass-autoprefixer.scss'];
      var sassFileContent = sassFile.getContent();
      var nextFile = src['/cssnext.css'];
      var nextFileContent = nextFile.getContent();

      expect(sassFile.derived.length).to.eq(1);
      expect(sassFile.derived[0].ext).to.eq('.map'); // 必须有 map 文件
      expect(sassFileContent).to.contain('sourceMappingURL');
      expect(sassFileContent).to.contain('-moz-linear');

      expect(nextFileContent).to.not.contain('@custom-media'); // 编译成功
      expect(nextFileContent).to.contain('sourceMappingURL'); // 存在 sourceMap
    });

    release().then(done);
  });

  it('自定义 plugins -- safe-parser', function (done) {
    self.options = {
      sourceMapRelative: true,
      processConfig: {
        parser: require('postcss-safe-parser')
      }
    };

    fis.match('safe-parser.css', {
      postprocessor: self
    });

    fis.on('release:end', function (ret) {
      var src = ret.src;
      var safeFile = src['/safe-parser.css'];
      var safeFileContent = safeFile.getContent();

      expect(safeFileContent).to.contain('}'); // 编译成功
      expect(safeFileContent).to.contain('sourceMappingURL'); // 存在 sourceMap
    });

    release().then(done);
  });
});
