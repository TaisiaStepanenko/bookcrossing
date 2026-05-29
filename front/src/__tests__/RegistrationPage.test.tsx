import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RegistrationPage } from '../pages/auth/registration'
import { renderWithProviders } from '../test-utils'

jest.mock('../components/DatePicker', () => ({
  CustomDatePicker: (props: any) => (
    <input
      data-testid="mock-date-picker"
      placeholder={props.placeholder}
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  ),
}))

jest.mock('../components/ui/Select', () => ({
  CustomSelect: ({ onChange, value, options, label, required, placeholder }: any) => (
    <div>
      {label && <span>{label}</span>}
      {required && <span style={{ color: 'red' }}>*</span>}
      <select data-testid="mock-city-select" value={value || ''} onChange={(e) => onChange?.(e.target.value)}>
        <option value="">{placeholder}</option>
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}))

const mockMutateAsync = jest.fn()

jest.mock('../api/hooks', () => ({
  useRegistration: () => ({ mutateAsync: mockMutateAsync, error: null }),
  useGetCities: () => ({ data: [{ cityId: 1, name: 'Москва' }] }),
  useInitSearchCity: () => {},
  useUserInfo: () => ({ data: null, isLoading: false }),
  useAddFavorite: () => ({ mutateAsync: jest.fn() }),
  useRemoveFavorite: () => ({ mutateAsync: jest.fn() }),
}))

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

const fillAllFields = async () => {
  await userEvent.type(screen.getByPlaceholderText('Введите имя'), 'Иван Иванов')
  await userEvent.type(screen.getByPlaceholderText('Введите эл. почту'), 'ivan@test.com')
  await userEvent.type(screen.getByPlaceholderText('Введите пароль'), '12345678')
  await userEvent.type(screen.getByPlaceholderText('Расскажите о себе'), 'Тестовый пользователь')

  const citySelect = screen.getByTestId('mock-city-select')

  fireEvent.change(citySelect, { target: { value: '1' } })

  const datePicker = screen.getByTestId('mock-date-picker')

  fireEvent.change(datePicker, { target: { value: '01.01.1990' } })
}

describe('RegistrationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('Тест 1: отображает форму регистрации', () => {
    renderWithProviders(<RegistrationPage />)
    expect(screen.getByPlaceholderText('Введите имя')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите эл. почту')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Расскажите о себе')).toBeInTheDocument()
    expect(screen.getByTestId('mock-city-select')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите дату')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Зарегистрироваться/i })).toBeInTheDocument()
  })

  test('Тест 2: при пустых обязательных полях показывает ошибку', async () => {
    renderWithProviders(<RegistrationPage />)

    const button = screen.getByRole('button', { name: /Зарегистрироваться/i })

    fireEvent.click(button)
    expect(await screen.findByText(/Введите обязательные поля!/i)).toBeInTheDocument()
  })

  test('Тест 3: при неверном email показывает ошибку', async () => {
    renderWithProviders(<RegistrationPage />)
    await userEvent.type(screen.getByPlaceholderText('Введите имя'), 'Иван')
    await userEvent.type(screen.getByPlaceholderText('Введите эл. почту'), 'invalid-email')
    await userEvent.type(screen.getByPlaceholderText('Введите пароль'), '12345678')
    await userEvent.type(screen.getByPlaceholderText('Расскажите о себе'), 'О себе')

    const citySelect = screen.getByTestId('mock-city-select')

    fireEvent.change(citySelect, { target: { value: '1' } })

    const datePicker = screen.getByTestId('mock-date-picker')

    fireEvent.change(datePicker, { target: { value: '01.01.1990' } })

    const button = screen.getByRole('button', { name: /Зарегистрироваться/i })

    fireEvent.click(button)
    expect(await screen.findByText(/Введите корректную почту/i)).toBeInTheDocument()
  })

  test('Тест 4: успешная регистрация вызывает мутацию с правильными данными', async () => {
    const mockResponse = { token: 'fake-token', cityId: 1, name: 'Иван Иванов', notificationNumber: 0 }

    mockMutateAsync.mockResolvedValue(mockResponse)
    renderWithProviders(<RegistrationPage />)
    await fillAllFields()

    const button = screen.getByRole('button', { name: /Зарегистрироваться/i })

    fireEvent.click(button)
    await waitFor(
      () =>
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Иван Иванов',
            email: 'ivan@test.com',
            password: '12345678',
            cityId: '1',
            description: 'Тестовый пользователь',
            birthday_date: '1990-01-01',
          }),
        ),
      { timeout: 10000 },
    )
  }, 30000)
})
