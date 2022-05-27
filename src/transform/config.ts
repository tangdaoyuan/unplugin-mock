import path from 'path'
import fg from 'fast-glob'
import { findNodeModule } from 'import-module-runtime'
import type { MockHandler, ModuleMockHandler, Options } from '../types'
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
    const mod = findNodeModule(mockFilePath)
    return (mod?.exports.default || [])
      .map((mock: MockHandler) =>
        ({ ...mock, _file: mockFilePath }),
      )
  })

  // 3. return config
  return mockReqData
}
