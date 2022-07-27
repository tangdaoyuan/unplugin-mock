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
      return {
        name: 'Tedy Patch',
      }
    },
  },
  {
    url: '/api/params/:name/:id?',
    method: 'get',
    response: (_req, _res) => {
      const { name, id } = _req.routes!
      _res.body = {
        code: 0,
        data: {
          msg: 'Tedy Params Match',
          name,
          id,
        },
      }
    },
  },
] as MockHandler[]
