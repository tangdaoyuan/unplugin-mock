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
  {
    url: '/api/post',
    method: 'post',
    response: {
      code: 0,
      data: {
        name: 'Tedy Post',
      },
    },
  },
  {
    url: '/api/patch',
    method: 'patch',
    response: (_req, _res) => {
      _res.writeHead(200, { 'Content-Type': 'application/json' })
      _res.end(JSON.stringify({
        code: 0,
        data: {
          name: 'Tedy Patch',
        },
      }))
    },
  },
] as MockHandler[]
