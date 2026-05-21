import request from 'supertest'

import { app } from '../app'
import { Book, OfferingBook, Transfer, User } from '../models'

let initiatorToken: string
let ownerToken: string
let initiatorId: number
let ownerId: number
let targetBookId: number
let offeredBookId: number
let exchangeId: number

// Вспомогательная функция: создание пользователя
async function createUser(emailPrefix: string) {
  const email = `${emailPrefix}_${Date.now()}_${Math.random()}@test.com`
  const res = await request(app).post('/api/user/registration').send({
    name: emailPrefix,
    email,
    password: '12345678',
    cityId: 1,
    birthday_date: '1990-01-01',
    description: 'test user',
  })

  if (res.status !== 200) {
    throw new Error(`Failed to create user: ${res.body.message || JSON.stringify(res.body)}`)
  }

  const token = res.body.token
  const user = await User.findOne({ where: { email } })

  if (!user) throw new Error('User not found after creation')

  return { token, userId: user.user_id }
}

// Вспомогательная функция: создание книги для пользователя
async function createBook(userToken: string, bookName: string, exchangeType = 'EXCHANGE') {
  const res = await request(app)
    .put('/api/books/add')
    .set('Authorization', `Bearer ${userToken}`)
    .field(
      'data',
      JSON.stringify({
        name: bookName,
        author: 'Test Author',
        exchangeType,
        exchangeMethod: 'MEETING',
        condition: 'GOOD',
        genre: ['Fiction'],
        cover: 'PAPERBACK',
      }),
    )
    .attach('photos', Buffer.from('dummy'), 'cover.jpg')

  if (res.status !== 200) {
    throw new Error(`Failed to create book: ${res.body.message || JSON.stringify(res.body)}`)
  }

  return res.body.bookId
}

// Очистка данных после теста
async function cleanupTestData() {
  if (exchangeId) {
    await Transfer.destroy({ where: { transfer_id: exchangeId } })
    exchangeId = 0
  }
  if (targetBookId) {
    await Book.destroy({ where: { book_id: targetBookId } })
    targetBookId = 0
  }
  if (offeredBookId) {
    await Book.destroy({ where: { book_id: offeredBookId } })
    offeredBookId = 0
  }
  if (initiatorId) {
    await User.destroy({ where: { user_id: initiatorId } })
    initiatorId = 0
  }
  if (ownerId) {
    await User.destroy({ where: { user_id: ownerId } })
    ownerId = 0
  }
  initiatorToken = ''
  ownerToken = ''
}

describe('Exchange Controller', () => {
  beforeEach(async () => {
    const init = await createUser('initiator')

    initiatorToken = init.token
    initiatorId = init.userId

    const owner = await createUser('owner')

    ownerToken = owner.token
    ownerId = owner.userId

    targetBookId = await createBook(ownerToken, 'Target Book')
    offeredBookId = await createBook(initiatorToken, 'Offered Book')
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  test('POST /api/exchanges/add/:id – создание заявки', async () => {
    const res = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({
        targetBookId,
        offeredBookIds: [offeredBookId],
        offerType: 'ONE',
      })

    expect(res.status).toBe(200)
    exchangeId = res.body.transfer_id
    expect(exchangeId).toBeDefined()
  })

  test('POST /api/exchanges/add/:id – попытка создать заявку на свою книгу', async () => {
    const res = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        targetBookId,
        offeredBookIds: [offeredBookId],
        offerType: 'ONE',
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Cannot exchange your own book/)
  })

  test('POST /api/exchanges/add/:id – попытка создать заявку без выбора своих книг', async () => {
    const res = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({
        targetBookId,
        offeredBookIds: [],
        offerType: 'ONE',
      })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  test('GET /api/exchanges/incoming – получение входящих заявок (владелец)', async () => {
    const createRes = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({
        targetBookId,
        offeredBookIds: [offeredBookId],
        offerType: 'ONE',
      })

    expect(createRes.status).toBe(200)
    exchangeId = createRes.body.transfer_id

    const res = await request(app).get('/api/exchanges/incoming').set('Authorization', `Bearer ${ownerToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  test('PATCH /api/exchanges/change/:id – принятие заявки владельцем (ожидание ответа → подтверждение)', async () => {
    const createRes = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({
        targetBookId,
        offeredBookIds: [offeredBookId],
        offerType: 'ONE',
      })

    expect(createRes.status).toBe(200)
    exchangeId = createRes.body.transfer_id

    const acceptRes = await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ activity: 'accept', keptBookIds: [offeredBookId] })

    expect(acceptRes.status).toBe(200)

    const transfer = await Transfer.findByPk(exchangeId)

    expect(transfer?.cur_status).toBe('WAITING_CONFIRMATION')

    const target = await Book.findByPk(targetBookId)

    expect(target?.status).toBe('IN_EXCHANGE')

    const offered = await Book.findByPk(offeredBookId)

    expect(offered?.status).toBe('IN_EXCHANGE')
  })

  test('PATCH /api/exchanges/change/:id – подтверждение начала обмена инициатором', async () => {
    const createRes = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({
        targetBookId,
        offeredBookIds: [offeredBookId],
        offerType: 'ONE',
      })

    expect(createRes.status).toBe(200)
    exchangeId = createRes.body.transfer_id

    await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ activity: 'accept', keptBookIds: [offeredBookId] })

    const confirmRes = await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({ activity: 'accept' })

    expect(confirmRes.status).toBe(200)

    const transfer = await Transfer.findByPk(exchangeId)

    expect(transfer?.cur_status).toBe('WAITING_TO_BE_SENT')

    const target = await Book.findByPk(targetBookId)

    expect(target?.status).toBe('IN_EXCHANGE')

    const offered = await Book.findByPk(offeredBookId)

    expect(offered?.status).toBe('IN_EXCHANGE')
  })

  test('GET /api/exchanges/running – получение текущих обменов (инициатор)', async () => {
    const createRes = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({
        targetBookId,
        offeredBookIds: [offeredBookId],
        offerType: 'ONE',
      })

    expect(createRes.status).toBe(200)
    exchangeId = createRes.body.transfer_id

    await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ activity: 'accept', keptBookIds: [offeredBookId] })
    await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({ activity: 'accept' })

    const res = await request(app).get('/api/exchanges/running').set('Authorization', `Bearer ${initiatorToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0].type).toBe('WAITING_TO_BE_SENT')
  })

  test('GET /api/exchanges/outcoming – получение исходящих заявок (инициатор)', async () => {
    const createRes = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({
        targetBookId,
        offeredBookIds: [offeredBookId],
        offerType: 'ONE',
      })

    expect(createRes.status).toBe(200)
    exchangeId = createRes.body.transfer_id

    const res = await request(app).get('/api/exchanges/outcoming').set('Authorization', `Bearer ${initiatorToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  test('PATCH /api/exchanges/change/:id – отмена заявки владельцем после перехода в WAITING_CONFIRMATION', async () => {
    const createRes = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({
        targetBookId,
        offeredBookIds: [offeredBookId],
        offerType: 'ONE',
      })

    expect(createRes.status).toBe(200)

    const newExchangeId = createRes.body.transfer_id

    await request(app)
      .patch(`/api/exchanges/change/${newExchangeId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ activity: 'accept' })

    const cancelRes = await request(app)
      .patch(`/api/exchanges/change/${newExchangeId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ activity: 'cancel' })

    expect(cancelRes.status).toBe(200)

    const transfer = await Transfer.findByPk(newExchangeId)

    expect(transfer?.cur_status).toBe('CANCELLED')

    const target = await Book.findByPk(targetBookId)

    expect(target?.status).toBe('AVAILABLE')

    const offered = await Book.findByPk(offeredBookId)

    expect(offered?.status).toBe('AVAILABLE')
  })

  test('PATCH /api/exchanges/incoming/rejectAll/:bookId – отмена всех заявок на книгу (владелец)', async () => {
    const secondOfferedBookId = await createBook(initiatorToken, 'Second Offered Book')

    const create1 = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({ targetBookId, offeredBookIds: [offeredBookId], offerType: 'ONE' })

    expect(create1.status).toBe(200)

    const create2 = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({ targetBookId, offeredBookIds: [secondOfferedBookId], offerType: 'ONE' })

    expect(create2.status).toBe(200)

    const rejectRes = await request(app)
      .patch(`/api/exchanges/incoming/rejectAll/${targetBookId}`)
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(rejectRes.status).toBe(200)

    const transfers = await Transfer.findAll({ where: { book_id: targetBookId } })

    transfers.forEach((t) => {
      expect(t.cur_status).toBe('CANCELLED')
    })

    const book = await Book.findByPk(targetBookId)

    expect(book?.status).toBe('AVAILABLE')

    await Book.destroy({ where: { book_id: secondOfferedBookId } })
  })

  test('POST /api/exchanges/add/:id – создание заявки на бесплатную книгу (FREE)', async () => {
    const freeBookId = await createBook(ownerToken, 'Free Book', 'FREE')

    const freeExchangeRes = await request(app)
      .post(`/api/exchanges/add/${freeBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({ targetBookId: freeBookId })

    expect(freeExchangeRes.status).toBe(200)

    const transfer = await Transfer.findByPk(freeExchangeRes.body.transfer_id)

    expect(transfer?.offerType).toBe('ONE')
    expect(transfer?.cur_status).toBe('WAITING_RESPONSE')

    await Book.destroy({ where: { book_id: freeBookId } })
  })

  test('GET /api/exchanges/ended – получение завершённых обменов', async () => {
    // Создаём заявку
    const createRes = await request(app)
      .post(`/api/exchanges/add/${targetBookId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({
        targetBookId,
        offeredBookIds: [offeredBookId],
        offerType: 'ONE',
      })

    expect(createRes.status).toBe(200)
    exchangeId = createRes.body.transfer_id

    // 1. Владелец принимает → WAITING_CONFIRMATION
    await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ activity: 'accept', keptBookIds: [offeredBookId] })
    // 2. Инициатор подтверждает → WAITING_TO_BE_SENT
    await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({ activity: 'accept' })
    // 3. Владелец отмечает отправку → SENT (для owner)
    await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ activity: 'accept' })
    // 4. Инициатор отмечает отправку → общий статус SENT
    await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({ activity: 'accept' })
    // 5. Владелец отмечает получение → RECEIVED (для owner)
    await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ activity: 'accept' })
    // 6. Инициатор отмечает получение → COMPLETED_SUCCESS
    await request(app)
      .patch(`/api/exchanges/change/${exchangeId}`)
      .set('Authorization', `Bearer ${initiatorToken}`)
      .send({ activity: 'accept' })

    // Убеждаемся, что обмен успешно завершён
    const finalTransfer = await Transfer.findByPk(exchangeId)

    expect(finalTransfer?.cur_status).toBe('COMPLETED_SUCCESS')

    const res = await request(app).get('/api/exchanges/ended').set('Authorization', `Bearer ${ownerToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)

    const endedExchange = res.body.find((e: any) => e.id === exchangeId)

    expect(endedExchange).toBeDefined()
  })
})
