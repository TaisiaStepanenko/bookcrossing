import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// import { immer } from 'zustand/middleware'
import type { RegistrationReturn } from '../api/models'

interface MyState {
  user?: RegistrationReturn
  profilePage: string
  setUser: (data: RegistrationReturn) => void
  changeProfilePage: (page: string) => void
  changeCity: (cityId: number) => void
  clearUser: () => void
}

export const useUserStore = create<MyState>()(
  immer((set) => ({
    profilePage: 'PROFILE',
    user: undefined,
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
      }),
  })),
)
