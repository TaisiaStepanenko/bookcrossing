import { fireEvent, screen } from '@testing-library/react'

import { ProfilePage } from '../pages/profile'
import { renderWithProviders } from '../test-utils'

const mockChangeProfilePage = jest.fn()
const mockClearUser = jest.fn()
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../api/hooks', () => ({
  useGetProfile: () => ({ data: { name: 'Иван', email: 'ivan@test.com', photo: '' } }),
  useGetBooks: () => ({ data: { items: [] } }),
  useInitSearchCity: () => {},
  useUserInfo: () => ({ data: null, isLoading: false }),
  useGetCities: () => ({ data: [] }),
  useAddFavorite: () => ({ mutateAsync: jest.fn() }),
  useRemoveFavorite: () => ({ mutateAsync: jest.fn() }),
}))

jest.mock('../store/user', () => ({
  useUserStore: (selector: any) =>
    selector({
      user: { name: 'Иван', notificationNumber: 0 },
      profilePage: 'PROFILE',
      changeProfilePage: mockChangeProfilePage,
      clearUser: mockClearUser,
      searchCity: 1,
      search: '',
      changeSearchCity: jest.fn(),
      changeSearch: jest.fn(),
      setUser: jest.fn(),
    }),
}))

jest.mock('../components/userProfile', () => ({
  UserProfile: () => <div data-testid="user-profile">UserProfile</div>,
}))
jest.mock('../components/myBooks', () => ({
  MyBooks: () => <div data-testid="my-books">MyBooks</div>,
}))
jest.mock('../components/bookExchange', () => ({
  BooksExchanges: () => <div data-testid="books-exchanges">BooksExchanges</div>,
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('Тест 1: отображает боковое меню и активную вкладку PROFILE', () => {
    renderWithProviders(<ProfilePage />)
    expect(screen.getByText('Личная информация')).toBeInTheDocument()
    expect(screen.getByText('Мои книги')).toBeInTheDocument()
    expect(screen.getByText('Избранное')).toBeInTheDocument()
    expect(screen.getByText('Заявки на обмен')).toBeInTheDocument()
    expect(screen.getByText('Текущие обмены')).toBeInTheDocument()
    expect(screen.getByText('Завершенные обмены')).toBeInTheDocument()
    expect(screen.getByText('Добавить книгу')).toBeInTheDocument()
    expect(screen.getByText('Выйти')).toBeInTheDocument()
    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
  })

  test('Тест 2: переключение вкладки вызывает changeProfilePage', () => {
    renderWithProviders(<ProfilePage />)

    const myBooksTab = screen.getByText('Мои книги')

    fireEvent.click(myBooksTab)
    expect(mockChangeProfilePage).toHaveBeenCalledWith('MY_BOOKS')
  })

  test('Тест 3: нажатие "Выйти" очищает localStorage, очищает пользователя и перенаправляет на каталог', () => {
    renderWithProviders(<ProfilePage />)

    const logoutButton = screen.getByText('Выйти')

    fireEvent.click(logoutButton)
    expect(localStorage.getItem('token')).toBeNull()
    expect(mockClearUser).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/catalog')
  })

  test('Тест 4: нажатие "Добавить книгу" переходит на страницу добавления', () => {
    renderWithProviders(<ProfilePage />)

    const addBookButton = screen.getByText('Добавить книгу')

    fireEvent.click(addBookButton)
    expect(mockNavigate).toHaveBeenCalledWith('/add')
  })
})
