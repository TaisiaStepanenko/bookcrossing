import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import type { RegistrationReturn } from '../api/models'

interface MyState {
  user?: RegistrationReturn
  profilePage: string
  search: string
  searchCity?: number
  setUser: (data: RegistrationReturn) => void
  changeProfilePage: (page: string) => void
  changeCity: (cityId: number) => void
  clearUser: () => void
  changeSearch: (searchData: string) => void
  changeSearchCity: (cityId?: number) => void
}

export const useUserStore = create<MyState>()(
  persist(
    immer((set) => ({
      profilePage: 'PROFILE',
      search: '',
      user: undefined,
      searchCity: undefined,
      changeSearch: (searchData) => {
        set((state) => {
          state.search = searchData
        })
      },
      setUser: (data) =>
        set((state) => {
          state.user = data
        }),
      changeCity: (cityId) =>
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, cityId }
          }
        }),
      changeProfilePage: (page) =>
        set((state) => {
          state.profilePage = page
        }),
      clearUser: () =>
        set((state) => {
          state.user = undefined
          state.searchCity = undefined
        }),
      changeSearchCity: (cityId) =>
        set((state) => {
          state.searchCity = cityId
        }),
    })),
    {
      name: 'user-storage',
      partialize: (state) => ({ searchCity: state.searchCity }),
    },
  ),
)
