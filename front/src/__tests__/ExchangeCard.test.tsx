import { BrowserRouter } from 'react-router-dom'

import { fireEvent, render, screen } from '@testing-library/react'

import type { IncomingExchange } from '../api/models'
import { ExchangeCard } from '../components/exchangeCard/index'

const mockChangeStatus = jest.fn()

jest.mock('../api/hooks', () => ({
  useChangeStatus: () => ({ mutate: mockChangeStatus }),
  useAddReview: () => ({ mutate: jest.fn() }),
}))

// Базовая заявка (входящая, обмен, одна книга)
const mockExchange: IncomingExchange = {
  id: 123,
  name: 'Иван Петров',
  avatar: '/avatar.jpg',
  bookCount: 'ONE',
  userType: 'OWNER',
  type: 'WAITING_RESPONSE',
  currentStatusInitiator: 'WAITING_RESPONSE',
  currentStatusOwner: 'WAITING_RESPONSE',
  exchangeType: 'EXCHANGE',
  hasReview: false,
  ownerBook: { id: 1, name: 'Книга владельца', src: '/book.jpg' },
  initiatorBooks: [{ id: 2, name: 'Книга инициатора', src: '/book2.jpg' }],
}

// Исходящая заявка (инициатор, а не владелец)
const outcomingExchange: IncomingExchange = {
  ...mockExchange,
  userType: 'INITIATOR',
  type: 'WAITING_RESPONSE',
}

// Заявка на книгу даром
const freeExchange: IncomingExchange = {
  ...mockExchange,
  exchangeType: 'FREE',
  initiatorBooks: [],
}

// Текущий обмен (running)
const runningExchange: IncomingExchange = {
  ...mockExchange,
  type: 'WAITING_TO_BE_SENT',
  currentStatusOwner: 'WAITING_TO_BE_SENT',
  userType: 'OWNER',
  initiatorBooks: [{ id: 2, name: 'Книга инициатора', src: '/book2.jpg' }],
}

// Завершённый обмен (ended)
const endedExchange: IncomingExchange = {
  ...mockExchange,
  type: 'COMPLETED_SUCCESS',
  hasReview: false,
}

describe('ExchangeCard', () => {
  beforeEach(() => {
    mockChangeStatus.mockClear()
  })

  // ========== Входящая заявка ==========
  test('Тест 1: отображает кнопки "Обменяться" и "Отклонить" для входящей заявки', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={mockExchange} type="incoming" />
      </BrowserRouter>,
    )
    expect(screen.getByText(/Обменяться/i)).toBeInTheDocument()
    expect(screen.getByText(/Отклонить/i)).toBeInTheDocument()
  })

  test('Тест 2: при нажатии "Обменяться" вызывается мутация с правильными параметрами', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={mockExchange} type="incoming" />
      </BrowserRouter>,
    )

    const offeredImage = document.querySelector('img[src*="book2.jpg"]') as HTMLElement

    expect(offeredImage).toBeInTheDocument()
    fireEvent.click(offeredImage)

    const acceptButton = screen.getByText(/Обменяться/i)

    fireEvent.click(acceptButton)
    expect(mockChangeStatus).toHaveBeenCalledWith(expect.objectContaining({ activity: 'accept', keptBookIds: [2] }))
  })

  test('Тест 3: при нажатии "Отклонить" вызывается мутация с cancel (два аргумента)', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={mockExchange} type="incoming" />
      </BrowserRouter>,
    )

    const rejectButton = screen.getByText(/Отклонить/i)

    fireEvent.click(rejectButton)
    expect(mockChangeStatus).toHaveBeenCalledWith(expect.objectContaining({ activity: 'cancel' }), expect.any(Object))
  })

  // ========== Исходящая заявка ==========
  test('Тест 4: для исходящей заявки отображаются кнопки "Обменяться" и "Отменить заявку"', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={outcomingExchange} type="outcoming" />
      </BrowserRouter>,
    )
    expect(screen.getByText(/Обменяться/i)).toBeInTheDocument()
    expect(screen.getByText(/Отменить заявку/i)).toBeInTheDocument()
  })

  test('Тест 5: при нажатии "Отменить заявку" вызывается мутация с cancel', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={outcomingExchange} type="outcoming" />
      </BrowserRouter>,
    )

    const cancelButton = screen.getByText(/Отменить заявку/i)

    fireEvent.click(cancelButton)
    expect(mockChangeStatus).toHaveBeenCalledWith(expect.objectContaining({ activity: 'cancel' }), expect.any(Object))
  })

  // ========== Заявка на книгу даром ==========
  test('Тест 6: для бесплатной заявки кнопка "Принять заявку"', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={freeExchange} type="incoming" />
      </BrowserRouter>,
    )
    expect(screen.getByText(/Принять заявку/i)).toBeInTheDocument()
    expect(screen.queryByText(/Обменяться/i)).not.toBeInTheDocument()
  })

  test('Тест 7: при нажатии "Принять заявку" вызывается мутация без keptBookIds', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={freeExchange} type="incoming" />
      </BrowserRouter>,
    )

    const acceptButton = screen.getByText(/Принять заявку/i)

    fireEvent.click(acceptButton)
    expect(mockChangeStatus).toHaveBeenCalledWith({ activity: 'accept' })
  })

  // ========== Текущий обмен (running) ==========
  test('Тест 8: для текущего обмена отображается кнопка "Отправить"', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={runningExchange} type="running" />
      </BrowserRouter>,
    )
    expect(screen.getByText(/Отправить/i)).toBeInTheDocument()
  })

  test('Тест 9: при нажатии "Отправить" вызывается мутация с accept', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={runningExchange} type="running" />
      </BrowserRouter>,
    )

    const sendButton = screen.getByText(/Отправить/i)

    fireEvent.click(sendButton)
    expect(mockChangeStatus).toHaveBeenCalledWith({ activity: 'accept' })
  })

  // ========== Завершённый обмен (ended) ==========
  test('Тест 10: для завершённого обмена без отзыва отображается кнопка "Оставить отзыв"', () => {
    render(
      <BrowserRouter>
        <ExchangeCard data={endedExchange} type="ended" />
      </BrowserRouter>,
    )
    expect(screen.getByText(/Оставить отзыв/i)).toBeInTheDocument()
  })

  test('Тест 11: если отзыв уже оставлен, кнопка не отображается', () => {
    const reviewedExchange = { ...endedExchange, hasReview: true }

    render(
      <BrowserRouter>
        <ExchangeCard data={reviewedExchange} type="ended" />
      </BrowserRouter>,
    )
    expect(screen.queryByText(/Оставить отзыв/i)).not.toBeInTheDocument()
  })
})
