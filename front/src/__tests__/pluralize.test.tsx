import { pluralize } from '../api/functions'

describe('pluralize', () => {
  const forms = ['сообщение', 'сообщения', 'сообщений']

  test('Тест 1: возвращает правильную форму для 1', () => {
    expect(pluralize(1, forms)).toBe('сообщение')
  })

  test('Тест 2: возвращает правильную форму для 2', () => {
    expect(pluralize(2, forms)).toBe('сообщения')
  })

  test('Тест 3: возвращает правильную форму для 5', () => {
    expect(pluralize(5, forms)).toBe('сообщений')
  })

  test('Тест 4: возвращает форму для 11 (особый случай)', () => {
    expect(pluralize(11, forms)).toBe('сообщений')
  })

  test('Тест 5: возвращает форму для 21 (в конце 1, но не 11)', () => {
    expect(pluralize(21, forms)).toBe('сообщение')
  })
})
