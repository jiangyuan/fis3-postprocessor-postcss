/**
 * fis3-postprocessor-postcss
 * @author jero
 * @date 2016-09-06
 */

var mapGuide = '\n/*# sourceMappingURL={url} */\n';
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');

var def = {
  processConfig: {},
  plugins: [], // 其他插件
  sourceMap: true, // 是否生成 source map
  sourceMapRelative: false // 指向 source map 的路径是否是相对路径
};

module.exports = function(content, file, conf) {
  // 只处理 css
  if (file.isCssLike) {
    var opts = fis.util.merge(def, conf);
    var plugins = opts.plugins;

    if (!plugins.length) {
      var config = typeof opts.autoprefixer === 'object' ? opts.autoprefixer : {};
      plugins.push(autoprefixer(config));
    }

    var derived = file.derived;
    var mapObj = null;

    if (!derived || !derived.length) {
      derived = file.extras && file.extras.derived;
    }

    if (derived && derived[0] && derived[0].rExt === '.map') {
      try {
        mapObj = JSON.parse(derived[0].getContent());
      } catch (e) {
        fis.log.info(e);
      }
    }

    opts.processConfig.map = opts.sourceMap ? {
      annotation: false,
      prev: mapObj ? mapObj : false
    } : false;

    var ret = postcss(plugins).process(content, opts.processConfig);

    content = ret.css;

    // 没有已存在的 source map 文件，创建一个
    if (!mapObj && opts.sourceMap) {
      var mapping = fis.file.wrap(file.dirname + '/' + file.filename + file.rExt + '.map');

      mapping.setContent(ret.map.toString('utf8'));

      file.extras = file.extras || {};
      file.extras.derived = file.extras.derived || [];
      file.extras.derived.push(mapping);

      var url = opts.sourceMapRelative ? ('./' + file.basename + '.map') :
        mapping.getUrl(fis.compile.settings.hash, fis.compile.settings.domain);

      content += mapGuide.replace('{url}', url);
    } else if (mapObj) {
      derived[0].setContent(ret.map.toString('utf8'));
    }
  }

  return content;
};
