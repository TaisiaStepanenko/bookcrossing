import request from 'supertest'

import { app } from '../app'

describe('City Controller', () => {
  test('GET /api/cities – получение списка городов', async () => {
    const res = await request(app).get('/api/cities')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('cityId')
      expect(res.body[0]).toHaveProperty('name')
    }
  })
})
