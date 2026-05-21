import request from 'supertest'

import { app } from '../app'
import { User } from '../models'

let authToken: string
let otherUserId: number
const testEmail = `usertest_${Date.now()}@test.com`
const otherEmail = `otheruser_${Date.now()}@test.com`

beforeAll(async () => {
  await User.destroy({ where: { email: testEmail } })
  await User.destroy({ where: { email: otherEmail } })

  const regRes = await request(app).post('/api/user/registration').send({
    name: 'User Tester',
    email: testEmail,
    password: '12345678',
    cityId: 1,
    birthday_date: '1990-01-01',
    description: 'unit test',
  })

  expect(regRes.status).toBe(200)
  authToken = regRes.body.token

  const otherReg = await request(app).post('/api/user/registration').send({
    name: 'Other User',
    email: otherEmail,
    password: '12345678',
    cityId: 1,
    birthday_date: '1990-01-01',
  })

  expect(otherReg.status).toBe(200)

  const otherRecord = await User.findOne({ where: { email: otherEmail } })

  if (otherRecord) otherUserId = otherRecord.user_id
})

afterAll(async () => {
  await User.destroy({ where: { email: testEmail } })
  await User.destroy({ where: { email: otherEmail } })
})

describe('User Controller', () => {
  test('GET /api/user/info', async () => {
    const res = await request(app).get('/api/user/info').set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('name', 'User Tester')
    expect(res.body).toHaveProperty('cityId')
  })

  test('GET /api/user/profile – свой профиль', async () => {
    const res = await request(app).get('/api/user/profile').set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('email', testEmail)
    expect(res.body).toHaveProperty('name', 'User Tester')
    expect(res.body).toHaveProperty('cityId')
  })

  test('GET /api/user/profile/:id – чужой профиль', async () => {
    const res = await request(app).get(`/api/user/profile/${otherUserId}`).set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.name).toBeDefined()
    expect(res.body.rating).toBeDefined()
  })
})
