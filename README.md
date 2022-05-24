# unplugin-mock
mock plugin for vite

## why not support webpack

Mock Service in webpack is not suitable for plugin implementation, because it is hard to affect `webpack-dev-server` config in webpack-plugin.

You can build a local mocker by [DevServer hook](https://webpack.js.org/configuration/dev-server/) or pick some readily available libs for devServer, suck as [mocker-api](https://github.com/jaywcjlove/mocker-api)


## TODO

- [x] the implementation first for vite
- [x] logger for hmr
- [x] ignore files options
- [x] restful url support
- [ ] enhance response for function mockHandler
- [ ] Keep url unique for function mockHandler
