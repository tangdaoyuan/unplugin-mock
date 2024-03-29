// mock.ts

import type { MockHandler } from '@/types'

export default [
  {
    url: '/api/base',
    method: 'get',
    response: () => {
      return {
        code: 0,
        data: {
          name: 'Tedy Base',
        },
      }
    },
  },
] as MockHandler[]
