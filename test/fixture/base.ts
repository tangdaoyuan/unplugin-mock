// mock.ts

import type { MockHandler } from '@/types'

export default [
  {
    url: '/api/get',
    method: 'get',
    response: () => {
      return {
        code: 0,
        data: {
          name: 'Tedy Get',
        },
      }
    },
  },
] as MockHandler[]
