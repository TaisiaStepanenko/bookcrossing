import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { message, notification } from 'antd'

import service from '../axios'
import { useUserStore } from '../store/user'
import type {
  Book,
  BookExchange,
  BooksCatalog,
  BooksFilters,
  ChangeStatus,
  IncomingAllExchanges,
  IncomingExchange,
  Login,
  Notification,
  Registration,
  RegistrationReturn,
  Review,
  UpdateProfile,
  UserProfile,
} from './models'

// USER

export const useUserInfo = () =>
  useQuery({ queryKey: ['user'], queryFn: () => getUserInfo(), enabled: Boolean(localStorage.getItem('token')) })

const getUserInfo = (): Promise<RegistrationReturn> => service.get('/api/user/info')

export const useRegistration = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: Registration) => registration(data),
    onSuccess: (data) => {
      useUserStore.getState().setUser(data)
      localStorage.setItem('token', data.token)
      navigate('/catalog')
    },
  })
}

const registration = (data: Registration): Promise<RegistrationReturn> => service.post('api/user/registration', data)

export const useLogin = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: Login) => login(data),
    onSuccess: (data) => {
      useUserStore.getState().setUser(data)
      localStorage.setItem('token', data.token)
      navigate('/catalog')
    },
  })
}

const login = (data: Login): Promise<RegistrationReturn> => service.post('/api/user/login', data)

export const useUpdateProfile = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => updateProfile(formData),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['profile'], refetchType: 'active' })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      navigate('/profile')
    },
    onError: (error: any) => {
      message.error(error?.response?.data.message || 'Ошибка обновления профиля')
    },
  })
}

const updateProfile = (formData: FormData): Promise<UpdateProfile> =>
  service.post('/api/user/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const useGetProfile = (id?: string) =>
  useQuery({ queryKey: ['profile', id], queryFn: () => getProfile(id), enabled: id !== undefined || id === '' })

const getProfile = (id?: string): Promise<UserProfile> =>
  service.get(id ? `/api/user/profile/${id}` : '/api/user/profile')

export const useGetNotification = () => useQuery({ queryKey: ['notifications'], queryFn: () => getNotification() })

const getNotification = (): Promise<Notification[]> => service.get('/api/user/notifications')

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: number) => service.patch(`/api/user/notifications/read/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

// COMMON
export const useGetCities = () => useQuery({ queryKey: ['cities'], queryFn: () => getCities() })

const getCities = (): Promise<{ cityId: number; name: string }[]> => service.get('/api/cities')

// BOOKS
export const useGetBooks = (filters: BooksFilters) =>
  useQuery({ queryKey: ['books', filters], queryFn: () => getBooks(filters) })

const getBooks = (filters: BooksFilters): Promise<BooksCatalog> => service.post('/api/books', filters)

export const useAddFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: number) => service.post(`/api/books/favorite/${bookId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['books', { favorite: true }] })
    },
  })
}

const addFavorite = (id: number): Promise<RegistrationReturn> => service.post(`/api/books/favorite/${id}`)

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: number) => service.delete(`/api/books/favorite/${bookId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['books', { favorite: true }] })
    },
  })
}

export const useGetBook = (id: number) =>
  useQuery({ queryKey: ['books', id], queryFn: () => getBook(id), enabled: !!id })

const getBook = (id: number): Promise<Book> => service.get(`/api/books/${id}`)

export const useAddBook = () => {
  return useMutation({
    mutationFn: (data: FormData) => addBook(data),
  })
}

const addBook = (data: FormData): Promise<void> => service.put('/api/books/add', data)

export const useUpdateBook = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => updateBook(id, data),
  })
}

const updateBook = (id: number, data: FormData): Promise<void> => service.post(`/api/books/edit/${id}`, data)

export const useDeleteBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteBook(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'], refetchType: 'active' }),
  })
}

const deleteBook = (id: number): Promise<void> => service.delete(`/api/books/delete/${id}`)

// EXCHANGES

export const useAddExchange = () => {
  return useMutation({
    mutationFn: (exchange: BookExchange) => addExchange(exchange),
  })
}

const addExchange = (exchange: BookExchange): Promise<void> => {
  return service.post(`/api/exchanges/add/${exchange.targetBookId}`, exchange)
}

export const useAddReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (review: Review) => addReview(review),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Exchanges'] }),
  })
}

const addReview = (review: Review): Promise<void> => {
  return service.post(`/api/reviews/create`, review)
}

export const useGetIncomingExchanges = () =>
  useQuery({ queryKey: ['incoming exchanges'], queryFn: () => getExchanges() })

const getExchanges = (): Promise<IncomingAllExchanges[]> => service.get(`/api/exchanges/incoming`)

export const useGetExchange = (type: 'incoming' | 'outcoming' | 'running' | 'ended', id?: string, enabled = true) => {
  return useQuery({
    queryKey: ['Exchanges', type, id],
    queryFn: () => getExchange(type, id),
    enabled: enabled && !!type,
  })
}

const getExchange = (type: string, id?: string): Promise<IncomingExchange[]> =>
  service.get(`/api/exchanges/${type}${id ? `/${id}` : ''}`)

export const useChangeStatus = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exchange: ChangeStatus) => changeStatus(id, exchange),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Exchanges'], refetchType: 'all' }),
  })
}

const changeStatus = (id: number, exchange: ChangeStatus): Promise<void> => {
  return service.patch(`/api/exchanges/change/${id}`, exchange)
}

export const useRejectAll = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => rejectAll(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incoming exchanges'], refetchType: 'all' }),
  })
}

const rejectAll = (id: number): Promise<void> => {
  return service.patch(`/api/exchanges/incoming/rejectAll/${id}`)
}

export const useInitSearchCity = () => {
  const { data: userData, isLoading } = useUserInfo()
  const searchCity = useUserStore((state) => state.searchCity)
  const changeSearchCity = useUserStore((state) => state.changeSearchCity)

  useEffect(() => {
    if (!isLoading && userData && searchCity === undefined && userData.cityId) {
      changeSearchCity(userData.cityId)
    }
  }, [userData, isLoading, searchCity, changeSearchCity])
}
