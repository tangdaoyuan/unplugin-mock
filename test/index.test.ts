import { expect, it } from 'vitest'
import vitePlugin from '@'

it('runs', () => {
  expect(vitePlugin).toBeTypeOf('object')
})
