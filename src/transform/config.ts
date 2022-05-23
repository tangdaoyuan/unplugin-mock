import path from 'path'
import _module from 'node:module'
import fg from 'fast-glob'
import { buildSync } from 'esbuild'
import type { ExposeNodeModule, GeneralOptions } from '../types'

export function transformConfig(
  _options: GeneralOptions,
): any[] {
  // 1. get mock filepath from options
  const { mockPath } = _options
  if (!mockPath)
    return []

  // get absolute path
  const mockFiles = fg.sync(`${mockPath}/**/*.ts`)

  // 2. compile mock file to cjs (esm not supported to compiled by source code)
  const mockReqData = mockFiles.flatMap((mockFile) => {
    const mockFilePath = path.resolve(mockFile)
    const rawCjsCode = buildCjsFile(mockFilePath)
    // 3. import or require mock file in current context
    const mod = new _module(mockFilePath) as ExposeNodeModule
    mod.paths = module.paths
    mod.filename = mockFile
    mod._compile(rawCjsCode, mockFile)

    return mod.exports.default || []
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
