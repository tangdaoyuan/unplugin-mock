// mock.ts

import type { MockHandler } from '@/types'

export default [
  {
    url: '/api/ignore',
    method: 'get',
    response: () => {
      return {
        code: 1,
        data: {
          name: 'Tedy Ignore Me Plz',
        },
      }
    },
  },
] as MockHandler[]
