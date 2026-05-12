import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, Flex, Typography } from 'antd'

import { BooksExchanges } from '../../components/bookExchange'
import { Container } from '../../components/common/container'
import { MyBooks } from '../../components/myBooks'
import { UserProfile } from '../../components/userProfile'
import { useUserStore } from '../../store/user'

import styles from './styles.module.scss'

const BUTTONS = [
  { name: 'PROFILE', icon: null, title: 'Личная информация' },
  { name: 'MY_BOOKS', icon: null, title: 'Мои книги' },
  { name: 'FAVORITE', icon: null, title: 'Избранное' },
  { name: 'REQUESTS', icon: null, title: 'Заявки на обмен' },
  { name: 'RUNNING_REQUESTS', icon: null, title: 'Текущие обмены' },
  { name: 'ENDED_REQUESTS', icon: null, title: 'Завершенные обмены' },
]

export const ProfilePage = () => {
  const navigate = useNavigate()
  const profilePage = useUserStore((store) => store.profilePage)
  const changeProfilePage = useUserStore((store) => store.changeProfilePage)
  const clearUser = useUserStore((state) => state.clearUser)

  return (
    <Container>
      <div style={{ minHeight: '100%', width: '100%' }}>
        <Flex>
          <Flex style={{ width: 285, height: 349 }}>
            <Card>
              <Flex vertical gap="small">
                <Typography.Text strong>Личный кабинет</Typography.Text>
                {BUTTONS.map(({ icon, name, title }) => (
                  <Typography.Text
                    key={name}
                    className={profilePage === name ? styles['profile-filter-selected'] : undefined}
                    style={{ cursor: 'pointer' }}
                    onClick={() => changeProfilePage(name)}
                  >
                    {title}
                  </Typography.Text>
                ))}
                <Typography.Text style={{ cursor: 'pointer' }} onClick={() => navigate('/add')}>
                  Добавить книгу
                </Typography.Text>

                <Typography.Text
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    localStorage.removeItem('token')
                    clearUser()
                    navigate('/catalog')
                  }}
                >
                  Выйти
                </Typography.Text>
              </Flex>
            </Card>
          </Flex>
          {profilePage === 'PROFILE' && <UserProfile />}
          {profilePage === 'REQUESTS' && <BooksExchanges />}
          {profilePage === 'RUNNING_REQUESTS' && <BooksExchanges type="running" />}
          {profilePage === 'ENDED_REQUESTS' && <BooksExchanges type="ended" />}
          {profilePage === 'MY_BOOKS' && <MyBooks isFavorite={false} />}
          {profilePage === 'FAVORITE' && <MyBooks isFavorite={true} />}
        </Flex>
      </div>
    </Container>
  )
}
