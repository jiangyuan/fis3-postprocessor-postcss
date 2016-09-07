fis3-postprocessor-postcss
==========================

fis3 的 [postcss](https://github.com/postcss/postcss) 插件。
内置 [autoprefixer](https://github.com/postcss/autoprefixer) 。

## 使用
### 安装

```
npm i fis3-postprocessor-postcss -g
```

### 配置
```js
fis.match('*.css', {
  postprocessor: fis.plugin('postcss')
});

// 如果你的项目中有 scss

fis.match('*.scss', {
  rExt: 'css',
  parser: fis.plugin('node-sass', {
    sourceMap: true
  })
});

// 非下划线开头的才 autoprefixer
fis.match(/.*\/[a-zA-Z0-9]+\.scss$/, {
  postprocessor: fis.plugin('postcss')
});
```

### 参数
```js
{
  processConfig: {}, // postcss().process 的参数，有些插件会用到 http://api.postcss.org/Processor.html#process)
  plugins: [], // 其他插件
  sourceMap: true, // 是否生成 source map
  sourceMapRelative: false // 指向 source map 的路径是否是相对路径，有些场景很有用
}
```

## 单测
```
npm t
```

## 其他 postcss 插件

```
var cssnext = require('postcss-cssnext');
fis.match('*.css', {
  postprocessor: fis.plugin('postcss', {
    plugins: [cssnext] // 内置的 autoperfixer 会被覆盖掉，当然 cssnext 自带 autoprefixer
  });
});
```

## FAQ
* Q: postprocessor.postcss: No element indexed by 5
>A: 使用 `sass` 并且全程启用 `sourceMap` 的时候，有时会抛出这个错误。
>请检查 `sass` 的 `import` 是否太过混乱，这个错误通常是因为 sourceMap 计算源文件的行列时遇到不合乎逻辑的各种奇怪文件依赖引起。

* Q: precss 不起作用

>A: precss 是异步 api ，这个在 fis 中无能为力。
