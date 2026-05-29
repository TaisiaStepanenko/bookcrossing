import { fireEvent, screen } from '@testing-library/react'

import * as antd from 'antd'

import { CatalogPage } from '../pages/catalog'
import { renderWithProviders } from '../test-utils'

const mockBooksData = {
  items: [
    {
      id: 1,
      name: 'Книга 1',
      author: 'Автор 1',
      place: 'MY_PLACE',
      src: '',
      exchangeType: 'EXCHANGE',
      exchangeMethod: 'MEETING',
      isFavorite: false,
    },
  ],
  page: 0,
  totalPages: 2,
}

let mockSearchCity: number | undefined = 1

jest.mock('../api/hooks', () => ({
  useGetBooks: () => ({ data: mockBooksData }),
  useGetCities: () => ({ data: [{ cityId: 1, name: 'Москва' }] }),
  useInitSearchCity: () => {},
  useUserInfo: () => ({ data: null, isLoading: false }),
  useAddFavorite: () => ({ mutateAsync: jest.fn() }),
  useRemoveFavorite: () => ({ mutateAsync: jest.fn() }),
}))

jest.mock('../store/user', () => ({
  useUserStore: (selector: any) =>
    selector({
      user: null,
      searchCity: mockSearchCity,
      search: '',
      changeSearchCity: jest.fn(),
      changeSearch: jest.fn(),
      setUser: jest.fn(),
      clearUser: jest.fn(),
    }),
}))

describe('CatalogPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchCity = 1
  })

  test('Тест 1: отображает книги из каталога', () => {
    renderWithProviders(<CatalogPage />)
    expect(screen.getByText('Книга 1')).toBeInTheDocument()
    expect(screen.getByText('Автор 1')).toBeInTheDocument()
  })

  test('Тест 2: чекбоксы фильтров переключаются', () => {
    renderWithProviders(<CatalogPage />)

    const checkbox = screen.getByLabelText(/По всей России/i)

    expect(checkbox).toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  test('Тест 3: при отсутствии выбранного города чекбоксы "Мой город" и "Ближайшие города" отключены', () => {
    mockSearchCity = undefined
    renderWithProviders(<CatalogPage />)

    const myPlaceCheckbox = screen.getByLabelText(/Только в моём городе/i)
    const nearCheckbox = screen.getByLabelText(/В ближайших городах/i)

    expect(myPlaceCheckbox).toBeDisabled()
    expect(nearCheckbox).toBeDisabled()
  })
})
