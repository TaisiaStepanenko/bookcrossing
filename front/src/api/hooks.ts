import { useNavigate } from 'react-router-dom'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import service from '../axios'
import { useUserStore } from '../store/user'
import { BOOKPAGEMOCK } from './mocks'
import type { Book, BooksCatalog, BooksFilters, Login, Registration, RegistrationReturn, UserProfile } from './models'

// USER

export const useUserInfo = () =>
  useQuery({ queryKey: ['user'], queryFn: () => getUserInfo(), enabled: Boolean(localStorage.getItem('token')) })

const getUserInfo = (): Promise<RegistrationReturn> => service.get('api/user/info')

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

export const useGetProfile = (id?: string) => useQuery({ queryKey: ['books', id], queryFn: () => getProfile(id) })

const getProfile = (id?: string): Promise<UserProfile> => service.get(`api/user/profile/${id}`)

export const useGetNotification = (filters: BooksFilters) =>
  useQuery({ queryKey: ['books', filters], queryFn: () => getBooks(filters) })

const getNotification = (): Promise<BooksCatalog> => service.get('/api/user/notifications', filters)

// COMMON
export const useGetCities = () => useQuery({ queryKey: ['cities'], queryFn: () => getCities() })

const getCities = (): Promise<{ cityId: number; name: string }[]> => service.get('/api/cities')

// BOOKS
export const useGetBooks = (filters: BooksFilters) =>
  useQuery({ queryKey: ['books', filters], queryFn: () => getBooks(filters) })

const getBooks = (filters: BooksFilters): Promise<BooksCatalog> => service.post('api/books', filters)

export const useAddFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => addFavorite(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['books'], refetchType: 'active' })
    },
  })
}

const addFavorite = (id: number): Promise<RegistrationReturn> => service.post(`api/books/favorite/${id}`)

export const useGetBook = (id: number) =>
  useQuery({ queryKey: ['books', id], queryFn: () => getBook(id), enabled: !!id })

const getBook = (id: number): Promise<Book> => service.get(`api/books/${id}`)

export const useAddBook = () => {
  return useMutation({
    mutationFn: (data: FormData) => addBook(data),
  })
}

const addBook = (data: FormData): Promise<void> => service.put('api/books/add', data)

export const useUpdateBook = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => updateBook(id, data),
  })
}

const updateBook = (id: number, data: FormData): Promise<void> => service.post(`api/books/edit/${id}`, data)

export const useDeleteBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteBook(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'], refetchType: 'active' }),
  })
}

const deleteBook = (id: number): Promise<void> => service.delete(`api/books/delete/${id}`)
