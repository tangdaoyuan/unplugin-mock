// mock.ts

import type { MockHandler } from '@/types'

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(1), time)
  })
}

export default [
  {
    url: '/api/promise',
    method: 'get',
    response: async() => {
      await sleep(3000)

      return {
        code: 0,
        data: {
          name: 'Tedy Get',
        },
      }
    },
  },
] as MockHandler[]
