# unplugin-mock
> mock plugin for vite


## Install
```bash
npm i vite-plugin-reload --save-dev
```
#
## Usage
```ts
import viteMockerPlugin from 'unplugin-mock/vite'

export default defineConfig({
  plugins: [
    // ... etc
    viteMockerPlugin({
      mockPath: './mock',
    }),
  ],
  // ...etc
})
```

## Options

### includes
- Path to mock directory
- Type: `string`
- Default: `''`
- Example: `'./mock'`

### ignore
- Ignore files
- Type: `string` | `RegExp` | `(RegExp | string)[]` 
- default: `[]`

### refresh
- Refresh page when mock file changed
- Type: `boolean`
- default: `false`

## why not support webpack

Mock Service in webpack is not suitable for plugin implementation, because it is hard to affect `webpack-dev-server` config in webpack-plugin.

You can build a local mocker by [DevServer hook](https://webpack.js.org/configuration/dev-server/) or pick some readily available libs for devServer, suck as [mocker-api](https://github.com/jaywcjlove/mocker-api)


## TODO

- [x] the implementation first for vite
- [x] logger for hmr
- [x] ignore files option
- [x] restful url support
- [ ] enhance response for function mockHandler
- [ ] Keep url unique for function mockHandler
- [ ] cache handler
