import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, Flex, Typography } from 'antd'

import { Container } from '../../components/common/container'
import { MyBooks } from '../../components/myBooks'
import { UserProfile } from '../../components/userProfile'

import styles from './styles.module.scss'
import { BooksExchanges } from '../../components/bookExchange'

const BUTTONS = [
  { name: 'PROFILE', icon: null, title: 'Личная информация' },
  { name: 'MY_BOOKS', icon: null, title: 'Мои книги' },
  { name: 'FAVORITE', icon: null, title: 'Избранное' },
  { name: 'REQUESTS', icon: null, title: 'Заявки на обмен' },
  { name: '', icon: null, title: 'Текущие обмены' },
  { name: '', icon: null, title: 'Завершенные обмены' },
]

export const ProfilePage = () => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('PROFILE')

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
                    className={selected === name ? styles['profile-filter-selected'] : undefined}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelected(name)}
                  >
                    {title}
                  </Typography.Text>
                ))}
                <Typography.Text style={{ cursor: 'pointer' }} onClick={() => navigate('/add')}>
                  Добавить книгу
                </Typography.Text>

                <Typography.Text style={{ cursor: 'pointer' }}>Выйти</Typography.Text>
              </Flex>
            </Card>
          </Flex>
          {selected === 'PROFILE' && <UserProfile />}
          {selected === 'REQUESTS' && <BooksExchanges />}
          {selected === 'MY_BOOKS' && <MyBooks isFavorite={false} />}
          {selected === 'FAVORITE' && <MyBooks isFavorite={true} />}
        </Flex>
      </div>
    </Container>
  )
}
