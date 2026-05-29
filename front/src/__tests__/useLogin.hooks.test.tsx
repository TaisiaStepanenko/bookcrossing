import { BrowserRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useLogin } from '../api/hooks'
import service from '../axios'

jest.mock('../axios')

const mockedService = service as jest.Mocked<typeof service>

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function ({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    )
  }
}

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Тест 1: успешный логин возвращает токен и данные пользователя', async () => {
    const mockData = {
      token: 'fake-token',
      cityId: 1,
      name: 'Test User',
      notificationNumber: 0,
    }

    mockedService.post.mockResolvedValue(mockData)

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'test@test.com', password: '12345678' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
    expect(mockedService.post).toHaveBeenCalledWith('/api/user/login', {
      email: 'test@test.com',
      password: '12345678',
    })
  })

  it('Тест 2: неуспешный логин вызывает ошибку', async () => {
    const error = { response: { data: { message: 'Invalid password' } } }

    mockedService.post.mockRejectedValue(error)

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'wrong@test.com', password: 'wrong' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})
