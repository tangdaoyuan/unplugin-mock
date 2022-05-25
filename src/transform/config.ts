import path from 'path'
import _module from 'node:module'
import fg from 'fast-glob'
import { buildSync } from 'esbuild'
import type { ExposeNodeModule, MockHandler, ModuleMockHandler, Options } from '../types'
import { getIgnoreMatcher } from '../util'

export function transformConfig(
  _options: Options,
): ModuleMockHandler[] {
  // 1. get mock filepath from options
  const { mockPath, ignore } = _options
  if (!mockPath)
    return []

  const ignoreMatcher = getIgnoreMatcher(ignore)

  const mockFiles = fg
    .sync(`${mockPath}/**/*`, {
      ignore: ignoreMatcher.filter(i => typeof i === 'string') as string[],
    })
    .filter(mockFile =>
      !ignoreMatcher.some((matcher) => {
        if (matcher instanceof RegExp)
          (matcher as RegExp)?.test(mockFile)
        return false
      }),
    )

  // 2. compile mock file to cjs (esm not supported to compiled by source code)
  const mockReqData = mockFiles.flatMap((mockFile) => {
    const mockFilePath = path.resolve(mockFile)
    const rawCjsCode = buildCjsFile(mockFilePath)
    // 3. import or require mock file in current context
    const mod = new _module(mockFilePath) as ExposeNodeModule
    mod.paths = module.paths
    mod.filename = mockFile
    mod._compile(rawCjsCode, mockFile)

    return (mod.exports.default || [])
      .map((mock: MockHandler) =>
        ({ ...mock, _file: mockFilePath }),
      )
  })

  // 4. return config
  return mockReqData
}

export function buildCjsFile(filePath: string) {
  if (!path.isAbsolute(filePath))
    filePath = path.resolve(filePath)
  const result = buildSync({
    entryPoints: [filePath],
    format: 'cjs',
    bundle: true,
    platform: 'node',
    write: false,
  })
  return result.outputFiles?.[0].text || ''
}
