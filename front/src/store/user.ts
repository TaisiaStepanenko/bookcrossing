import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// import { immer } from 'zustand/middleware'
import type { RegistrationReturn } from '../api/models'

interface MyState {
  user?: RegistrationReturn
  setUser: (data: RegistrationReturn) => void
}

export const useUserStore = create<MyState>()(
  immer((set) => ({
    user: undefined,
    setUser: (data) =>
      set((state) => {
        // With Immer, you can mutate the state directly
        state.user = data
      }),
  })),
)
