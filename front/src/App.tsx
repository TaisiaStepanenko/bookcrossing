import { Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

import { Spin } from 'antd'

import { useUserInfo } from './api/hooks'
import { AddBookPage } from './pages/addBook'
import { LoginPage } from './pages/auth/login'
import { RegistrationPage } from './pages/auth/registration'
import { BookPage } from './pages/bookPage'
import { CatalogPage } from './pages/catalog'
import { HomePage } from './pages/home'
import { NotFound } from './pages/notFound'
import { NotificationPage } from './pages/notificationPage'
import { ProfilePage } from './pages/profile'
import { UserProfilePage } from './pages/userProfile'
import { useUserStore } from './store/user'

const App = () => {
  const user = useUserInfo()

  useEffect(() => {
    if (user.data) {
      useUserStore.getState().setUser(user.data)
    }
  }, [user])

  if (user.isLoading) return <Spin />

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/add" element={<AddBookPage />} />
        <Route path="/book/:id" element={<BookPage />} />
        <Route path="/book/edit/:id" element={<AddBookPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/user/:id" element={<UserProfilePage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
