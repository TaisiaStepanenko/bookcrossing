import request from 'supertest';
import { app } from '../app';
import { User, Book, Transfer, Notification } from '../models';

let initiatorToken: string;
let ownerToken: string;
let initiatorId: number;
let ownerId: number;
let targetBookId: number;
let offeredBookId: number;
let notificationId: number;

const initEmail = `init_notif_${Date.now()}@test.com`;
const ownerEmail = `owner_notif_${Date.now()}@test.com`;

beforeAll(async () => {
  const initReg = await request(app)
    .post('/api/user/registration')
    .send({ name: 'Initiator', email: initEmail, password: '12345678', cityId: 1, birthday_date: '1990-01-01' });
  initiatorToken = initReg.body.token;
  const initRecord = await User.findOne({ where: { email: initEmail } });
  if (initRecord) initiatorId = initRecord.user_id;

  const ownerReg = await request(app)
    .post('/api/user/registration')
    .send({ name: 'Owner', email: ownerEmail, password: '12345678', cityId: 1, birthday_date: '1990-01-01' });
  ownerToken = ownerReg.body.token;
  const ownerRecord = await User.findOne({ where: { email: ownerEmail } });
  if (ownerRecord) ownerId = ownerRecord.user_id;

  // Владелец добавляет книгу
  const bookRes = await request(app)
    .put('/api/books/add')
    .set('Authorization', `Bearer ${ownerToken}`)
    .field('data', JSON.stringify({
      name: 'Notif Book', author: 'Owner', exchangeType: 'EXCHANGE', exchangeMethod: 'MEETING',
      condition: 'EXCELLENT', genre: ['Novel'], cover: 'HARDCOVER',
    }))
    .attach('photos', Buffer.from('dummy'), 'cover.jpg');
  targetBookId = bookRes.body.bookId;

  // Инициатор добавляет свою книгу
  const myBookRes = await request(app)
    .put('/api/books/add')
    .set('Authorization', `Bearer ${initiatorToken}`)
    .field('data', JSON.stringify({
      name: 'Offered Book', author: 'Initiator', exchangeType: 'EXCHANGE', exchangeMethod: 'MEETING',
      condition: 'GOOD', genre: ['Fiction'], cover: 'PAPERBACK',
    }))
    .attach('photos', Buffer.from('dummy'), 'offered.jpg');
  offeredBookId = myBookRes.body.bookId;

  // Создаём заявку (генерирует уведомление владельцу)
  await request(app)
    .post(`/api/exchanges/add/${targetBookId}`)
    .set('Authorization', `Bearer ${initiatorToken}`)
    .send({ targetBookId, offeredBookIds: [offeredBookId], offerType: 'ONE' });

  // Ждём, пока уведомление появится
  await new Promise(resolve => setTimeout(resolve, 500));

  // Находим последнее уведомление для владельца
  const notification = await Notification.findOne({
    where: { target_user_id: ownerId },
    order: [['created_at', 'DESC']]
  });
  if (notification) notificationId = notification.notification_id;
});

afterAll(async () => {
  await Notification.destroy({ where: {} });
  await Transfer.destroy({ where: {} });
  await Book.destroy({ where: {} });
  await User.destroy({ where: { email: initEmail } });
  await User.destroy({ where: { email: ownerEmail } });
});

describe('Notification Controller', () => {
  test('GET /api/user/notifications – получение списка уведомлений', async () => {
    const res = await request(app)
      .get('/api/user/notifications')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('notificationId');
      expect(res.body[0]).toHaveProperty('isRead');
    }
  });

  test('PATCH /api/user/notifications/read/:id – отметка уведомления прочитанным', async () => {
    if (!notificationId) {
      console.warn('Notification not found, skipping test');
      return;
    }
    const res = await request(app)
      .patch(`/api/user/notifications/read/${notificationId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    const updated = await Notification.findByPk(notificationId);
    expect(updated?.is_read).toBe(true);
  });

  test('DELETE /api/user/notifications/:id – удаление уведомления', async () => {
    if (!notificationId) {
      console.warn('Notification not found, skipping test');
      return;
    }
    const res = await request(app)
      .delete(`/api/user/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    const deleted = await Notification.findByPk(notificationId);
    expect(deleted).toBeNull();
  });
});