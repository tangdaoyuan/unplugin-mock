// mock.ts

export default [
  {
    url: '/api/get',
    method: 'get',
    response: () => {
      return {
        code: 0,
        data: {
          name: 'Tedy',
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
        name: 'Tedy',
      },
    },
  },
]
