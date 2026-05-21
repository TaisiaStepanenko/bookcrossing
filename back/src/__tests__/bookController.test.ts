import request from 'supertest';
import { app } from '../app';
import { Book, User } from '../models';

let authToken: string;
let userId: number;
let testBookId: number;

// Вспомогательная функция для создания пользователя
async function createTestUser() {
  const email = `booktest_${Date.now()}_${Math.random()}@test.com`;
  const res = await request(app)
    .post('/api/user/registration')
    .send({
      name: 'Иван Иванов',
      email,
      password: '12345678',
      cityId: 1,
      birthday_date: '1990-01-01',
      description: 'unit test',
    });
  if (res.status !== 200) throw new Error('User registration failed');
  return { token: res.body.token, userId: res.body.userId };
}

// Очистка после каждого теста
async function cleanupTestData() {
  if (testBookId) {
    await Book.destroy({ where: { book_id: testBookId } });
    testBookId = 0;
  }
  if (userId) {
    await User.destroy({ where: { user_id: userId } });
    userId = 0;
  }
}

describe('Book Controller', () => {
  beforeEach(async () => {
    const { token, userId: id } = await createTestUser();
    authToken = token;
    userId = id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  test('POST /api/books - вывод каталога книг (без применения фильтров)', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ cityId: 1, page: 0 });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body).toHaveProperty('totalPages');
  });

  test('POST /api/books – с фильтрацией', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ cityId: 1, condition: ['EXCELLENT'] });
    expect(res.status).toBe(200);
  });

  test('PUT /api/books/add – добавление новой книги (с фото)', async () => {
    const res = await request(app)
      .put('/api/books/add')
      .set('Authorization', `Bearer ${authToken}`)
      .field('data', JSON.stringify({
        name: 'Test Book',
        author: 'Test Author',
        exchangeType: 'EXCHANGE',
        exchangeMethod: 'MEETING',
        condition: 'GOOD',
        defects: '',
        genre: ['Fiction'],
        cover: 'PAPERBACK',
      }))
      .attach('photos', Buffer.from('fake image'), 'test.jpg');
    expect(res.status).toBe(200);
    testBookId = res.body.bookId;
    expect(testBookId).toBeDefined();
  });

  test('GET /api/books/:id - получение книги по id', async () => {
    const addRes = await request(app)
      .put('/api/books/add')
      .set('Authorization', `Bearer ${authToken}`)
      .field('data', JSON.stringify({
        name: 'Test Book',
        author: 'Test Author',
        exchangeType: 'EXCHANGE',
        exchangeMethod: 'MEETING',
        condition: 'GOOD',
        genre: ['Fiction'],
        cover: 'PAPERBACK',
      }))
      .attach('photos', Buffer.from('fake image'), 'test.jpg');
    expect(addRes.status).toBe(200);
    const bookId = addRes.body.bookId;

    const res = await request(app).get(`/api/books/${bookId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Book');

    await Book.destroy({ where: { book_id: bookId } });
  });

  test('POST /api/books/favorite/:id - добавление книги в избранное', async () => {
    const addRes = await request(app)
      .put('/api/books/add')
      .set('Authorization', `Bearer ${authToken}`)
      .field('data', JSON.stringify({
        name: 'Fav Book',
        author: 'Author',
        exchangeType: 'EXCHANGE',
        exchangeMethod: 'MEETING',
        condition: 'GOOD',
        genre: ['Fiction'],
        cover: 'PAPERBACK',
      }))
      .attach('photos', Buffer.from('fake'), 'test.jpg');
    expect(addRes.status).toBe(200);
    const bookId = addRes.body.bookId;

    const res = await request(app)
      .post(`/api/books/favorite/${bookId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);

    await Book.destroy({ where: { book_id: bookId } });
  });

  test('DELETE /api/books/favorite/:id – удаление книги из избранного', async () => {
    const addRes = await request(app)
      .put('/api/books/add')
      .set('Authorization', `Bearer ${authToken}`)
      .field('data', JSON.stringify({
        name: 'Fav Book 2',
        author: 'Author',
        exchangeType: 'EXCHANGE',
        exchangeMethod: 'MEETING',
        condition: 'GOOD',
        genre: ['Fiction'],
        cover: 'PAPERBACK',
      }))
      .attach('photos', Buffer.from('fake'), 'test.jpg');
    expect(addRes.status).toBe(200);
    const bookId = addRes.body.bookId;

    await request(app)
      .post(`/api/books/favorite/${bookId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const delRes = await request(app)
      .delete(`/api/books/favorite/${bookId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(delRes.status).toBe(200);

    const checkRes = await request(app)
      .get(`/api/books/${bookId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(checkRes.body.isFavorite).toBe(false);

    await Book.destroy({ where: { book_id: bookId } });
  });

  test('POST /api/books/edit/:id – редактирование книги', async () => {
    const addRes = await request(app)
      .put('/api/books/add')
      .set('Authorization', `Bearer ${authToken}`)
      .field('data', JSON.stringify({
        name: 'Original Name',
        author: 'Original Author',
        exchangeType: 'EXCHANGE',
        exchangeMethod: 'MEETING',
        condition: 'GOOD',
        genre: ['Fiction'],
        cover: 'PAPERBACK',
      }))
      .attach('photos', Buffer.from('fake'), 'test.jpg');
    expect(addRes.status).toBe(200);
    const bookId = addRes.body.bookId;

    const editRes = await request(app)
      .post(`/api/books/edit/${bookId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .field('data', JSON.stringify({
        name: 'Updated Book Name',
        author: 'Updated Author',
        exchangeType: 'FREE',
        exchangeMethod: 'DELIVERY',
        condition: 'EXCELLENT',
        defects: 'some defects',
        genre: ['Detective'],
        cover: 'HARDCOVER',
      }))
      .attach('photos', Buffer.from('new photo'), 'new.jpg');
    expect(editRes.status).toBe(200);

    const updated = await Book.findByPk(bookId);
    expect(updated?.name).toBe('Updated Book Name');
    expect(updated?.exchangeType).toBe('FREE');

    await Book.destroy({ where: { book_id: bookId } });
  });

  test('DELETE /api/books/delete/:id – удаление книги', async () => {
    const addRes = await request(app)
      .put('/api/books/add')
      .set('Authorization', `Bearer ${authToken}`)
      .field('data', JSON.stringify({
        name: 'To Delete',
        author: 'Author',
        exchangeType: 'EXCHANGE',
        exchangeMethod: 'MEETING',
        condition: 'GOOD',
        genre: ['Fiction'],
        cover: 'PAPERBACK',
      }))
      .attach('photos', Buffer.from('fake'), 'test.jpg');
    expect(addRes.status).toBe(200);
    const bookId = addRes.body.bookId;

    const delRes = await request(app)
      .delete(`/api/books/delete/${bookId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(delRes.status).toBe(200);

    const deleted = await Book.findByPk(bookId);
    expect(deleted).toBeNull();
  });
});