import { fireEvent, screen } from '@testing-library/react'

import type { BookCatalogItem } from '../api/models'
import { BookCard } from '../components/bookCard'
import { renderWithProviders } from '../test-utils'

const mockAddFavorite = jest.fn()
const mockRemoveFavorite = jest.fn()

jest.mock('../api/hooks', () => ({
  useAddFavorite: () => ({ mutateAsync: mockAddFavorite }),
  useRemoveFavorite: () => ({ mutateAsync: mockRemoveFavorite }),
}))

const mockItem: BookCatalogItem = {
  id: 1,
  name: 'Война и мир',
  author: 'Лев Толстой',
  place: 'MY_PLACE',
  src: '/uploads/photo.jpg',
  exchangeType: 'EXCHANGE',
  exchangeMethod: 'MEETING',
  isFavorite: false,
}

describe('BookCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Тест 1: отображает название, автора', () => {
    renderWithProviders(<BookCard item={mockItem} />)
    expect(screen.getByText('Война и мир')).toBeInTheDocument()
    expect(screen.getByText('Лев Толстой')).toBeInTheDocument()
  })

  test('Тест 2: клик по карточке переходит на страницу книги', () => {
    renderWithProviders(<BookCard item={mockItem} />)

    const titleElement = screen.getByText('Война и мир')

    fireEvent.click(titleElement)
    expect(window.location.pathname).toBe('/book/1')
  })

  test('Тест 3: кнопка лайка вызывает добавление в избранное', () => {
    renderWithProviders(<BookCard item={mockItem} />)

    const heartButton = screen.getByRole('button', { name: /heart/i })

    fireEvent.click(heartButton)
    expect(mockAddFavorite).toHaveBeenCalledWith(1)
  })

  test('Тест 4: если книга уже в избранном, кнопка удаляет из избранного', () => {
    const favoriteItem = { ...mockItem, isFavorite: true }

    renderWithProviders(<BookCard item={favoriteItem} />)

    const heartButton = screen.getByRole('button', { name: /heart/i })

    fireEvent.click(heartButton)
    expect(mockRemoveFavorite).toHaveBeenCalledWith(1)
  })
})
