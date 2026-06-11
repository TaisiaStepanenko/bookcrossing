import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, Flex, Typography } from 'antd'

import BooksIcon from '../../assets/icons/book-closed.svg'
import endIcon from '../../assets/icons/check-heart.svg'
import ReqIcon from '../../assets/icons/check.svg'
import HeartIcon from '../../assets/icons/heart-rounded.svg'
import AddIcon from '../../assets/icons/icons8-add-book-64.png'
import RunIcon from '../../assets/icons/refresh-cw-02.svg'
import UserIcon from '../../assets/icons/user-03.svg'
import { BooksExchanges } from '../../components/bookExchange'
import { Container } from '../../components/common/container'
import { MyBooks } from '../../components/myBooks'
import { UserProfile } from '../../components/userProfile'
import { useUserStore } from '../../store/user'

import styles from './styles.module.scss'

const BUTTONS = [
  { name: 'PROFILE', icon: UserIcon, title: 'Личная информация' },
  { name: 'MY_BOOKS', icon: BooksIcon, title: 'Мои книги' },
  { name: 'FAVORITE', icon: HeartIcon, title: 'Избранное' },
  { name: 'REQUESTS', icon: ReqIcon, title: 'Заявки на обмен' },
  { name: 'RUNNING_REQUESTS', icon: RunIcon, title: 'Текущие обмены' },
  { name: 'ENDED_REQUESTS', icon: endIcon, title: 'Завершенные обмены' },
  { name: 'ADD_BOOK', icon: AddIcon, title: 'Добавить книгу' },
]

export const ProfilePage = () => {
  const navigate = useNavigate()
  const profilePage = useUserStore((store) => store.profilePage)
  const changeProfilePage = useUserStore((store) => store.changeProfilePage)
  const clearUser = useUserStore((state) => state.clearUser)

  return (
    <Container fullHeight={false}>
      <div style={{ minHeight: '100%', width: '100%' }}>
        <Flex>
          <Flex>
            <Card
              style={{ width: 285, height: 385, borderRadius: 20, marginRight: 20 }}
              styles={{ body: { padding: '32px 24px' } }}
            >
              <Flex vertical style={{ gap: '32px' }}>
                <Flex vertical gap={16}>
                  <Typography.Title level={3} style={{ lineHeight: 1.2, fontWeight: 600, color: '#000F08' }}>
                    Личный кабинет
                  </Typography.Title>
                  {BUTTONS.map(({ icon, name, title }) => {
                    const isAddBook = name === 'ADD_BOOK'

                    return (
                      <Flex
                        key={name}
                        align="center"
                        gap={4}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (isAddBook) {
                            navigate('/add')
                          } else {
                            changeProfilePage(name)
                          }
                        }}
                      >
                        <img
                          src={icon}
                          alt={title}
                          width={16}
                          height={16}
                          className={!isAddBook && profilePage === name ? styles['active-icon'] : ''}
                        />
                        <Typography.Text
                          className={!isAddBook && profilePage === name ? styles['profile-filter-selected'] : undefined}
                        >
                          {title}
                        </Typography.Text>
                      </Flex>
                    )
                  })}
                </Flex>
                <Typography.Text
                  style={{ cursor: 'pointer', color: '#F53535' }}
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
