import request from 'supertest'

import { app } from '../app'
import { User } from '../models'

describe('Auth Controller', () => {
  const testUser = {
    name: 'Иван Иванов',
    email: 'ivanov@test.com',
    password: '12345678',
    cityId: 1,
    birthday_date: '1990-01-01',
    description: 'unit test',
  }

  afterEach(async () => {
    await User.destroy({ where: { email: testUser.email } })
  })

  test('POST /api/user/registration – успешная регистрация', async () => {
    const res = await request(app).post('/api/user/registration').send(testUser)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')

    const user = await User.findOne({ where: { email: testUser.email } })

    expect(user).not.toBeNull()
  })

  test('POST /api/user/registration – дубликат email', async () => {
    await request(app).post('/api/user/registration').send(testUser)

    const res = await request(app).post('/api/user/registration').send(testUser)

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/already exists/i)
  })

  test('POST /api/user/registration – короткий пароль', async () => {
    const res = await request(app)
      .post('/api/user/registration')
      .send({ ...testUser, password: '123' })

    expect(res.status).toBe(400)
    expect(res.body.errors[0].message).toMatch(/минимум из 6 символов/)
  })

  test('POST /api/user/login – успешный вход', async () => {
    await request(app).post('/api/user/registration').send(testUser)

    const res = await request(app).post('/api/user/login').send({ email: testUser.email, password: testUser.password })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  test('POST /api/user/login – неверный пароль', async () => {
    await request(app).post('/api/user/registration').send(testUser)

    const res = await request(app).post('/api/user/login').send({ email: testUser.email, password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/Invalid password/)
  })

  test('POST /api/user/login – несуществующий email', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'nonexistent@test.com', password: testUser.password })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/not registered/)
  })
})
