import { useNavigate } from 'react-router-dom'

import { fireEvent, screen } from '@testing-library/react'

import { NotificationPage } from '../pages/notificationPage'
import { renderWithProviders } from '../test-utils'

const mockMarkAsRead = jest.fn()
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../api/hooks', () => ({
  useGetNotification: () => ({ data: mockNotifications }),
  useMarkNotificationAsRead: () => ({ mutate: mockMarkAsRead }),
  useInitSearchCity: () => {},
  useUserInfo: () => ({ data: null, isLoading: false }),
  useGetCities: () => ({ data: [] }),
  useAddFavorite: () => ({ mutateAsync: jest.fn() }),
  useRemoveFavorite: () => ({ mutateAsync: jest.fn() }),
}))

let mockProfilePage = 'PROFILE'
const mockChangeProfilePage = jest.fn((page) => {
  mockProfilePage = page
})

jest.mock('../store/user', () => ({
  useUserStore: (selector: any) =>
    selector({
      user: null,
      searchCity: 1,
      search: '',
      profilePage: mockProfilePage,
      changeProfilePage: mockChangeProfilePage,
      changeSearchCity: jest.fn(),
      changeSearch: jest.fn(),
      setUser: jest.fn(),
      clearUser: jest.fn(),
    }),
}))

const baseNotification = {
  notificationId: 1,
  userId: 2,
  userName: 'Иван',
  transferId: 10,
  isRead: false,
  createdAt: '2025-01-01',
  bookTitle: 'Война и мир',
  exchangeType: 'EXCHANGE',
  transferStatus: 'WAITING_RESPONSE',
}

const mockNotifications: any[] = [
  {
    ...baseNotification,
    notificationId: 1,
    messageType: 'EXCHANGE',
    curStutus: 'NEW',
    transferStatus: 'WAITING_RESPONSE',
  },
  { ...baseNotification, notificationId: 2, messageType: 'REVIEW', curStutus: null },
  {
    ...baseNotification,
    notificationId: 3,
    messageType: 'EXCHANGE',
    curStutus: 'RUNNING',
    transferStatus: 'WAITING_TO_BE_SENT',
  },
  {
    ...baseNotification,
    notificationId: 4,
    messageType: 'EXCHANGE',
    curStutus: 'ENDED',
    transferStatus: 'COMPLETED_SUCCESS',
  },
]

describe('NotificationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockProfilePage = 'PROFILE'
  })

  test('Тест 1: отображает уведомление о новом предложении обмена', () => {
    renderWithProviders(<NotificationPage />)
    expect(screen.getByText(/Пользователь Иван предлагает обмен/)).toBeInTheDocument()

    const newMessages = screen.getAllByText(/Новое сообщение/i)

    expect(newMessages.length).toBeGreaterThan(0)
  })

  test('Тест 2: отображает правильное количество уведомлений (pluralize)', () => {
    renderWithProviders(<NotificationPage />)
    expect(screen.getByText(/4 сообщения/)).toBeInTheDocument()
  })

  test('Тест 3: отображает уведомление типа REVIEW', () => {
    renderWithProviders(<NotificationPage />)
    expect(screen.getByText(/Пользователь Иван оставил отзыв об обмене книги "Война и мир"/)).toBeInTheDocument()
  })

  test('Тест 4: отображает уведомление EXCHANGE со статусом RUNNING', () => {
    renderWithProviders(<NotificationPage />)
    expect(screen.getByText(/Пользователь Иван обновил статус обмена книги "Война и мир"/)).toBeInTheDocument()
  })

  test('Тест 5: отображает уведомление EXCHANGE со статусом ENDED', () => {
    renderWithProviders(<NotificationPage />)
    expect(screen.getByText(/Обмен с пользователем Иван завершён. Вы можете оставить отзыв./)).toBeInTheDocument()
  })

  test('Тест 6: при клике на ссылку "Перейти к заявке" вызывается markAsRead и навигация', () => {
    renderWithProviders(<NotificationPage />)

    const links = screen.getAllByText(/Перейти к заявке./i)

    expect(links.length).toBeGreaterThan(0)
    fireEvent.click(links[0])
    expect(mockMarkAsRead).toHaveBeenCalledWith(1)
    expect(mockChangeProfilePage).toHaveBeenCalledWith('REQUESTS')
    expect(mockNavigate).toHaveBeenCalledWith('/profile')
  })

  test('Тест 7: при клике на уведомление типа REVIEW вызывается markAsRead и навигация на профиль', () => {
    renderWithProviders(<NotificationPage />)

    const reviewLinks = screen.getAllByText(/Перейти к отзыву./i)

    expect(reviewLinks.length).toBeGreaterThan(0)
    fireEvent.click(reviewLinks[0])
    expect(mockMarkAsRead).toHaveBeenCalledWith(2)
    expect(mockChangeProfilePage).toHaveBeenCalledWith('PROFILE')
    expect(mockNavigate).toHaveBeenCalledWith('/profile')
  })
})
