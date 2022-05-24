import type { Options } from '@/types'

const dotFile = /(^|[\/\\])\../

export function getIgnoreMatcher(ignore: Options['ignore']) {
  const _ignores: (string | RegExp) [] = [dotFile]
  if (Array.isArray(ignore))
    _ignores.push(...ignore)
  else
    _ignores.push(ignore)
  return _ignores
}
