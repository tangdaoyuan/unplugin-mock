// base.js

export default [
  {
    url: '/api/js/base',
    method: 'get',
    response: () => {
      return {
        code: 0,
        data: {
          name: 'Tedy JS Base',
        },
      }
    },
  },
]
