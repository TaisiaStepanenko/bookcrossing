import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  Book,
  BOOK_CONDITION,
  BOOK_COVER,
  BookCatalogItem,
  EXCHANGE_METHOD,
  EXCHANGE_TYPE,
  PLACES,
} from '../api/models'
import { BookPage } from '../pages/bookPage'
import { renderWithProviders } from '../test-utils'

const defaultBook: Book = {
  bookId: 1,
  name: 'Тестовая книга',
  author: 'Тестовый автор',
  description: 'Описание книги',
  exchangeType: EXCHANGE_TYPE.EXCHANGE.en,
  exchangeMethod: EXCHANGE_METHOD.MEETING.en,
  condition: BOOK_CONDITION.EXCELLENT.en,
  defects: 'Нет',
  genre: ['Фантастика'],
  cover: BOOK_COVER.HARDCOVER.en,
  publisherHouse: 'Издательство',
  year: 2023,
  series: 'Серия',
  registrationDate: '2024-01-01',
  obtainingMethod: 'Самовывоз',
  isMy: false,
  isFavorite: false,
  photos: [{ isMain: true, url: '/uploads/photo.jpg' }],
  otherBooks: [] as BookCatalogItem[],
  userInfo: {
    shortName: 'Иван',
    city: 1,
    name: 'Иван Петров',
    avatar: '/avatar.jpg',
    userId: 10,
    raiting: 4.5,
    reviewNumber: 3,
    registrationDate: '2024-01-01',
  },
}

const otherBook: BookCatalogItem = {
  id: 2,
  name: 'Другая книга',
  author: 'Автор',
  place: PLACES.MY_PLACE.en,
  src: '',
  exchangeType: EXCHANGE_TYPE.EXCHANGE.en,
  exchangeMethod: EXCHANGE_METHOD.MEETING.en,
  isFavorite: false,
}

defaultBook.otherBooks = [otherBook]

const mockAddFavorite = jest.fn()
const mockRemoveFavorite = jest.fn()
const mockDeleteBook = jest.fn()
const mockNavigate = jest.fn()

let mockBookData = defaultBook

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}))

jest.mock('../api/hooks', () => ({
  useGetBook: () => ({ data: mockBookData, isLoading: false, isError: false, error: null }),
  useAddFavorite: () => ({ mutateAsync: mockAddFavorite }),
  useRemoveFavorite: () => ({ mutateAsync: mockRemoveFavorite }),
  useDeleteBook: () => ({ mutateAsync: mockDeleteBook }),
  useInitSearchCity: () => {},
  useUserInfo: () => ({ data: null, isLoading: false }),
  useGetCities: () => ({ data: [] }),
}))

jest.mock('../store/user', () => ({
  useUserStore: (selector: any) =>
    selector({
      user: null,
      searchCity: 1,
      search: '',
      changeSearchCity: jest.fn(),
      changeSearch: jest.fn(),
      setUser: jest.fn(),
      clearUser: jest.fn(),
    }),
}))

describe('BookPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBookData = defaultBook
  })

  test('Тест 1: отображает информацию о книге', () => {
    renderWithProviders(<BookPage />)
    expect(screen.getByText('Тестовая книга')).toBeInTheDocument()
    expect(screen.getByText('Тестовый автор')).toBeInTheDocument()
    expect(screen.getByText('Описание книги')).toBeInTheDocument()
    expect(screen.getByText(/Фантастика/)).toBeInTheDocument()

    const publisherElements = screen.getAllByText('Издательство')

    expect(publisherElements.length).toBe(2)
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  test('Тест 2: для чужой книги отображается кнопка "Предложить обмен"', () => {
    renderWithProviders(<BookPage />)
    expect(screen.getByText(/Предложить обмен/i)).toBeInTheDocument()
  })

  test('Тест 3: для своей книги отображаются кнопки "Редактировать" и "Удалить"', () => {
    mockBookData = { ...defaultBook, isMy: true }
    renderWithProviders(<BookPage />)
    expect(screen.getByText(/Редактировать/i)).toBeInTheDocument()
    expect(screen.getByText(/Удалить/i)).toBeInTheDocument()
  })

  test('Тест 4: при нажатии "Удалить" вызывается удаление книги и навигация', async () => {
    mockBookData = { ...defaultBook, isMy: true }
    mockDeleteBook.mockResolvedValue({})
    renderWithProviders(<BookPage />)

    const deleteButton = screen.getByText(/Удалить/i)

    await userEvent.click(deleteButton)
    expect(mockDeleteBook).toHaveBeenCalledWith({ id: 1 })
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/catalog'))
  })

  test('Тест 5: отображаются "Другие предложения пользователя"', () => {
    renderWithProviders(<BookPage />)
    expect(screen.getByText(/Другие предложения пользователя/i)).toBeInTheDocument()
    expect(screen.getByText('Другая книга')).toBeInTheDocument()
  })
})
