# unplugin-mock
mock plugin for vite, rollup, esbuild

## why not support webpack

Mock Service in webpack is not suitable for plugin implemention, because it is hard to affect `webpack-dev-server` config in webpack-plugin.

You can build a local mocker by [DevServer hook](https://webpack.js.org/configuration/dev-server/) or pick some readily available libs for devServer, suck as [mocker-api](https://github.com/jaywcjlove/mocker-api)


## TODO

- [ ] implementation first for vite
- [ ] support rollup by create custom server (such as h3...etc)
- [ ] provide programmatic usage for static files
- [ ] support esbuild
