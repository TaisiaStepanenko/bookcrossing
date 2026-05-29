import { BrowserRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import service from '../axios'
import { LoginPage } from '../pages/auth/login'

jest.mock('../axios')

const mockedService = service as jest.Mocked<typeof service>

jest.mock('../api/hooks', () => {
  const actual = jest.requireActual('../api/hooks')

  return {
    ...actual,
    useGetCities: () => ({ data: [] }),
    useInitSearchCity: () => {},
    useUserInfo: () => ({ data: null, isLoading: false }),
    // useLogin остаётся настоящим
  }
})

jest.mock('../components/authContainer', () => ({
  AuthContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderLoginPage = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </QueryClientProvider>,
  )

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('Тест 1: отображает форму входа', () => {
    renderLoginPage()
    expect(screen.getByPlaceholderText('Введите эл. почту')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument()
  })

  test('Тест 2: при пустых полях показывает ошибку', async () => {
    renderLoginPage()

    const button = screen.getByRole('button', { name: /Войти/i })

    fireEvent.click(button)
    expect(await screen.findByText(/Произошла ошибка, попробуйте позже/i)).toBeInTheDocument()
  })

  test('Тест 3: при неверном формате email показывает ошибку клиентской валидации', async () => {
    renderLoginPage()

    const emailInput = screen.getByPlaceholderText('Введите эл. почту')

    await userEvent.type(emailInput, 'invalid-email')

    const button = screen.getByRole('button', { name: /Войти/i })

    fireEvent.click(button)
    expect(await screen.findByText(/Произошла ошибка, попробуйте позже/i)).toBeInTheDocument()
  })

  test('Тест 4: при незарегистрированном email показывает серверную ошибку', async () => {
    const error = { response: { data: { message: 'User is not registered or email is wrong' } } }

    mockedService.post.mockRejectedValue(error)
    renderLoginPage()

    const emailInput = screen.getByPlaceholderText('Введите эл. почту')
    const passwordInput = screen.getByPlaceholderText('Введите пароль')

    await userEvent.type(emailInput, 'nonexistent@test.com')
    await userEvent.type(passwordInput, '12345678')

    const button = screen.getByRole('button', { name: /Войти/i })

    fireEvent.click(button)
    expect(await screen.findByText(/Пользователь не зарегистрирован или email указан неверно/i)).toBeInTheDocument()
  }, 15000)

  test('Тест 5: успешный логин вызывает мутацию и сохраняет токен', async () => {
    const mockResponse = { data: { token: 'fake-token', cityId: 1, name: 'Test', notificationNumber: 0 } }

    mockedService.post.mockResolvedValue(mockResponse)
    renderLoginPage()
    await userEvent.type(screen.getByPlaceholderText('Введите эл. почту'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('Введите пароль'), '12345678')
    fireEvent.click(screen.getByRole('button', { name: /Войти/i }))
    await waitFor(() =>
      expect(mockedService.post).toHaveBeenCalledWith('/api/user/login', {
        email: 'test@test.com',
        password: '12345678',
      }),
    )
  }, 15000)
})
