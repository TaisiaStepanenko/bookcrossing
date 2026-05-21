import request from 'supertest';
import { app } from '../app';
import { User, Book, Transfer, Review, OfferingBook } from '../models';

// Вспомогательная функция: создание пользователя
async function createUser(namePrefix: string) {
  const email = `${namePrefix}_${Date.now()}_${Math.random()}@test.com`;
  const res = await request(app)
    .post('/api/user/registration')
    .send({
      name: namePrefix,
      email,
      password: '12345678',
      cityId: 1,
      birthday_date: '1990-01-01',
    });
  if (res.status !== 200) throw new Error('User registration failed');
  const user = await User.findOne({ where: { email } });
  return { token: res.body.token, userId: user!.user_id, email };
}

// Вспомогательная функция: создание книги
async function createBook(userToken: string, bookName: string) {
  const res = await request(app)
    .put('/api/books/add')
    .set('Authorization', `Bearer ${userToken}`)
    .field('data', JSON.stringify({
      name: bookName,
      author: 'Test Author',
      exchangeType: 'EXCHANGE',
      exchangeMethod: 'MEETING',
      condition: 'GOOD',
      genre: ['Fiction'],
      cover: 'PAPERBACK',
    }))
    .attach('photos', Buffer.from('dummy'), 'cover.jpg');
  if (res.status !== 200) throw new Error('Book creation failed');
  return res.body.bookId;
}

// Создание завершённого обмена
async function createCompletedExchange(initiatorToken: string, ownerToken: string) {
  // Создаём книги
  const targetId = await createBook(ownerToken, 'Target Book');
  const offeredId = await createBook(initiatorToken, 'Offered Book');

  // Создаём заявку
  const exchangeRes = await request(app)
    .post(`/api/exchanges/add/${targetId}`)
    .set('Authorization', `Bearer ${initiatorToken}`)
    .send({ targetBookId: targetId, offeredBookIds: [offeredId], offerType: 'ONE' });
  if (exchangeRes.status !== 200) throw new Error('Exchange creation failed');
  const exchangeId = exchangeRes.body.transfer_id;

  // Проходим полный жизненный цикл обмена
  // Владелец принимает (WAITING_CONFIRMATION)
  await request(app)
    .patch(`/api/exchanges/change/${exchangeId}`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ activity: 'accept', keptBookIds: [offeredId] });

  // Инициатор подтверждает (WAITING_TO_BE_SENT)
  await request(app)
    .patch(`/api/exchanges/change/${exchangeId}`)
    .set('Authorization', `Bearer ${initiatorToken}`)
    .send({ activity: 'accept' });

  // Владелец отправляет (меняет свой статус)
  await request(app)
    .patch(`/api/exchanges/change/${exchangeId}`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ activity: 'accept' });

  // Инициатор отправляет (общий статус SENT)
  await request(app)
    .patch(`/api/exchanges/change/${exchangeId}`)
    .set('Authorization', `Bearer ${initiatorToken}`)
    .send({ activity: 'accept' });

  // Владелец получает
  await request(app)
    .patch(`/api/exchanges/change/${exchangeId}`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ activity: 'accept' });

  // Инициатор получает (COMPLETED_SUCCESS)
  await request(app)
    .patch(`/api/exchanges/change/${exchangeId}`)
    .set('Authorization', `Bearer ${initiatorToken}`)
    .send({ activity: 'accept' });

  const transfer = await Transfer.findByPk(exchangeId);
  if (!transfer || transfer.cur_status !== 'COMPLETED_SUCCESS') {
    throw new Error(`Exchange status is ${transfer?.cur_status}, expected COMPLETED_SUCCESS`);
  }

  return { exchangeId, targetBookId: targetId, offeredBookId: offeredId };
}

describe('Review Controller', () => {
  let userAToken: string;
  let userBToken: string;
  let testEmailA: string;
  let testEmailB: string;
  let completedTransferId: number;
  let targetBookId: number;
  let offeredBookId: number;

  beforeEach(async () => {
    const userA = await createUser('reviewer');
    userAToken = userA.token;
    testEmailA = userA.email;

    const userB = await createUser('reviewed');
    userBToken = userB.token;
    testEmailB = userB.email;

    
    const result = await createCompletedExchange(userAToken, userBToken);
    completedTransferId = result.exchangeId;
    targetBookId = result.targetBookId;
    offeredBookId = result.offeredBookId;
  });

  afterEach(async () => {
    if (completedTransferId) {
      await Review.destroy({ where: { transfer_id: completedTransferId } });
      await OfferingBook.destroy({ where: { transfer_id: completedTransferId } });
      await Transfer.destroy({ where: { transfer_id: completedTransferId } });
    }
    if (targetBookId) await Book.destroy({ where: { book_id: targetBookId } });
    if (offeredBookId) await Book.destroy({ where: { book_id: offeredBookId } });
    if (testEmailA) await User.destroy({ where: { email: testEmailA } });
    if (testEmailB) await User.destroy({ where: { email: testEmailB } });
  });

  test('POST /api/reviews/create – успешное создание отзыва (рейтинг + комментарий)', async () => {
    const res = await request(app)
      .post('/api/reviews/create')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ transferId: completedTransferId, rating: 5, comment: 'Отличный собеседник!' });
    expect(res.status).toBe(201);
    expect(Number(res.body.rating)).toBe(5);
    expect(res.body.comment).toBe('Отличный собеседник!');
  });

  test('POST /api/reviews/create – повторный отзыв на тот же обмен (ошибка 409)', async () => {
    await request(app)
      .post('/api/reviews/create')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ transferId: completedTransferId, rating: 5 });

    const res = await request(app)
      .post('/api/reviews/create')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ transferId: completedTransferId, rating: 4 });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already reviewed/i);
  });

  test('POST /api/reviews/create – отзыв от пользователя, не участвовавшего в обмене (ошибка 403)', async () => {
    const outsider = await createUser('outsider');
    const res = await request(app)
      .post('/api/reviews/create')
      .set('Authorization', `Bearer ${outsider.token}`)
      .send({ transferId: completedTransferId, rating: 3 });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not a participant/i);

    await User.destroy({ where: { email: outsider.email } });
  });

  test('POST /api/reviews/create – попытка оставить отзыв без рейтинга (ошибка валидации)', async () => {
    const res = await request(app)
      .post('/api/reviews/create')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ transferId: completedTransferId, comment: 'Без рейтинга' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/reviews/create – отзыв на обмен, не завершённый успешно (ошибка 400)', async () => {
    const targetId = await createBook(userBToken, 'Temp Target');
    const offeredId = await createBook(userAToken, 'Temp Offered');

    const exchangeRes = await request(app)
      .post(`/api/exchanges/add/${targetId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ targetBookId: targetId, offeredBookIds: [offeredId], offerType: 'ONE' });
    expect(exchangeRes.status).toBe(200);
    const tempExchangeId = exchangeRes.body.transfer_id;

    await request(app)
      .patch(`/api/exchanges/change/${tempExchangeId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ activity: 'accept', keptBookIds: [offeredId] });

    const res = await request(app)
      .post('/api/reviews/create')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ transferId: tempExchangeId, rating: 5 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not completed/i);

    await Book.destroy({ where: { book_id: targetId } });
    await Book.destroy({ where: { book_id: offeredId } });
  });
});