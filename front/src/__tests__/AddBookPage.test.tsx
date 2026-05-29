import React from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { type Book, BOOK_CONDITION, BOOK_COVER, EXCHANGE_METHOD, EXCHANGE_TYPE } from '../api/models'
import { AddBookPage } from '../pages/addBook'
import { renderWithProviders } from '../test-utils'

let mockUseGetBookReturn: {
  data: Book | null
  isLoading: boolean
  isError: boolean
  error: Error | null
} = { data: null, isLoading: false, isError: false, error: null }

let mockUseParamsReturn: { id?: string } = {}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParamsReturn,
}))

const mockAddBook = jest.fn()
const mockUpdateBook = jest.fn()
const mockNavigate = jest.fn()

jest.mock('../api/hooks', () => ({
  useAddBook: () => ({ mutate: mockAddBook, isPending: false }),
  useUpdateBook: () => ({ mutate: mockUpdateBook, isPending: false }),
  useGetBook: () => mockUseGetBookReturn,
  useInitSearchCity: () => {},
  useUserInfo: () => ({ data: null, isLoading: false }),
  useGetCities: () => ({ data: [] }),
  useAddFavorite: () => ({ mutateAsync: jest.fn() }),
  useRemoveFavorite: () => ({ mutateAsync: jest.fn() }),
}))

jest.mock('../components/ui/Select', () => ({
  CustomSelect: ({ onChange, value, options, label, required, placeholder, mode }: any) => (
    <div>
      {label && <span>{label}</span>}
      {required && <span style={{ color: 'red' }}>*</span>}
      <select data-testid={`mock-select-${label}`} value={value || ''} onChange={(e) => onChange?.(e.target.value)}>
        <option value="">{placeholder}</option>
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {mode === 'multiple' && <div data-testid="multiple-select-mock">Множественный выбор замокан</div>}
    </div>
  ),
}))

jest.mock('../components/ui/Input', () => ({
  TextField: ({ onChange, value, label, required, placeholder, rows, name, type }: any) => (
    <div>
      {label && <span>{label}</span>}
      {required && <span style={{ color: 'red' }}>*</span>}
      {rows ? (
        <textarea
          data-testid={`mock-textarea-${name}`}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange?.(e)}
        />
      ) : (
        <input
          data-testid={`mock-input-${name}`}
          type={type || 'text'}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange?.(e)}
        />
      )}
    </div>
  ),
}))

jest.mock('../components/DatePicker', () => ({
  CustomDatePicker: (props: any) => (
    <input
      data-testid="mock-date-picker"
      placeholder={props.placeholder}
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  ),
}))

jest.mock('../components/addPhotos', () => ({
  AddPhotos: ({ fileList, setFileList }: any) => {
    React.useEffect(() => {
      if (fileList.length === 0) {
        setFileList([{ uid: '1', name: 'photo.jpg', originFileObj: new File([], 'photo.jpg') }])
      }
    }, [fileList, setFileList])

    return <div data-testid="add-photos">Mock AddPhotos</div>
  },
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

describe('AddBookPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParamsReturn = {}
    mockUseGetBookReturn = { data: null, isLoading: false, isError: false, error: null }
  })

  const fillFirstPage = async () => {
    await userEvent.type(screen.getByTestId('mock-input-name'), 'Новая книга')
    await userEvent.type(screen.getByTestId('mock-input-author'), 'Автор')

    const genreSelect = screen.getByTestId('mock-select-Жанр книги')

    fireEvent.change(genreSelect, { target: { value: 'Фантастика' } })

    const coverSelect = screen.getByTestId('mock-select-Тип обложки')

    fireEvent.change(coverSelect, { target: { value: 'HARDCOVER' } })
    await userEvent.type(screen.getByTestId('mock-input-publisherHouse'), 'Издательство')
    await userEvent.type(screen.getByTestId('mock-input-year'), '2023')
    await userEvent.type(screen.getByTestId('mock-input-series'), 'Серия')
    await userEvent.type(screen.getByTestId('mock-textarea-description'), 'Описание')

    const nextButton = screen.getByRole('button', { name: /Далее/i })

    fireEvent.click(nextButton)
    await waitFor(() => expect(screen.getByTestId('mock-select-Состояние')).toBeInTheDocument())
  }

  const fillSecondPage = async () => {
    const conditionSelect = screen.getByTestId('mock-select-Состояние')

    fireEvent.change(conditionSelect, { target: { value: 'EXCELLENT' } })
    await userEvent.type(screen.getByTestId('mock-input-defects'), 'Нет дефектов')

    const exchangeMethodSelect = screen.getByTestId('mock-select-Способы обмена')

    fireEvent.change(exchangeMethodSelect, { target: { value: 'MEETING' } })

    const exchangeTypeSelect = screen.getByTestId('mock-select-Желаете получить книгу в обмен?')

    fireEvent.change(exchangeTypeSelect, { target: { value: 'EXCHANGE' } })
    await userEvent.type(screen.getByTestId('mock-textarea-obtainingMethod'), 'Самовывоз')
  }

  test('Тест 1: отображает первый шаг формы', () => {
    renderWithProviders(<AddBookPage />)
    expect(screen.getByTestId('mock-input-name')).toBeInTheDocument()
    expect(screen.getByTestId('mock-input-author')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Далее/i })).toBeInTheDocument()
  })

  test('Тест 2: переход на второй шаг после заполнения обязательных полей', async () => {
    renderWithProviders(<AddBookPage />)
    await fillFirstPage()

    await waitFor(() => expect(screen.getByTestId('mock-select-Состояние')).toBeInTheDocument(), { timeout: 10000 })

    const submitButton = screen.getByRole('button', { name: /^Добавить$/ })

    expect(submitButton).toBeInTheDocument()
  }, 15000)

  test('Тест 3: при редактировании книги загружаются данные', async () => {
    mockUseParamsReturn = { id: '10' }

    const existingBook: Book = {
      bookId: 10,
      name: 'Старая книга',
      author: 'Старый автор',
      exchangeType: EXCHANGE_TYPE.EXCHANGE.en,
      exchangeMethod: EXCHANGE_METHOD.MEETING.en,
      condition: BOOK_CONDITION.GOOD.en,
      defects: 'Потертости',
      genre: ['Роман'],
      cover: BOOK_COVER.PAPERBACK.en,
      publisherHouse: 'Старое издательство',
      year: 2000,
      series: 'Старая серия',
      description: 'Старое описание',
      obtainingMethod: 'Почта',
      photos: [{ isMain: true, url: '/uploads/old.jpg' }],
      isMy: false,
      isFavorite: false,
      registrationDate: '2023-01-01',
      otherBooks: [],
      userInfo: {
        shortName: 'Старый',
        city: 1,
        name: 'Старый пользователь',
        avatar: '',
        userId: 1,
        raiting: 0,
        reviewNumber: 0,
        registrationDate: '2023-01-01',
      },
    }

    mockUseGetBookReturn = {
      data: existingBook,
      isLoading: false,
      isError: false,
      error: null,
    }

    renderWithProviders(<AddBookPage />)
    await waitFor(() => {
      expect(screen.getByTestId('mock-input-name')).toHaveValue('Старая книга')
      expect(screen.getByTestId('mock-input-author')).toHaveValue('Старый автор')
    })
  })
})
