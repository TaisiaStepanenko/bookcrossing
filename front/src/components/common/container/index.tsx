import { useNavigate } from 'react-router-dom'

import { BellOutlined, HeartOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'

import { Button, Col, Flex, Input, Layout, Row, Space, Typography } from 'antd'
import { useShallow } from 'zustand/shallow'

import { useGetCities, useInitSearchCity } from '../../../api/hooks'
import FooterBooks from '../../../assets/footerBooks.png'
import Logo from '../../../assets/logo.png'
import Quote from '../../../assets/quote.png'
import { useUserStore } from '../../../store/user'
import { CustomSelect } from '../../ui/Select'

import styles from './style.module.scss'

const { Header, Content, Footer } = Layout

export const Container = ({ children }: { children: React.ReactNode }) => {
  useInitSearchCity()

  const navigate = useNavigate()
  const cities = useGetCities()

  const [user, search, changeSearch] = useUserStore(
    useShallow(({ user, search, changeSearch }) => [user, search, changeSearch]),
  )

  const searchCity = useUserStore((state) => state.searchCity)
  const changeSearchCity = useUserStore((state) => state.changeSearchCity)

  return (
    <Flex vertical>
      <div className={styles.container}>
        <Header className={styles.header}>
          <Flex align="center" justify="center" gap="middle">
            <div>
              <img src={Logo} style={{ cursor: 'pointer' }} onClick={() => navigate('/catalog')} />
            </div>
            <CustomSelect
              onChange={changeSearchCity}
              value={searchCity}
              required
              placeholder="Город"
              style={{ width: '100%' }}
              options={(cities.data || []).map(({ cityId, name }) => ({ value: cityId, label: name }))}
              allowClear
            />
          </Flex>

          <div>
            <Flex gap="small">
              <Input
                placeholder="Я ищу…"
                size="middle"
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                styles={{ input: { borderRadius: '9999px' } }}
              />
              <Button shape="circle" icon={<SearchOutlined />} onClick={() => navigate('/catalog')} />
            </Flex>
          </div>

          <Space size="small">
            {user ? (
              <>
                <Button type="text" icon={<HeartOutlined />} />
                <Flex align="center">
                  <Button type="text" icon={<BellOutlined />} onClick={() => navigate('/notifications')} />
                  <Typography.Text>({user?.notificationNumber || 0})</Typography.Text>
                </Flex>
                <Button type="text" icon={<UserOutlined />} onClick={() => navigate('/profile')} />
              </>
            ) : (
              <Button type="text" onClick={() => navigate('/login')}>
                Войти
              </Button>
            )}
          </Space>
        </Header>

        <Content className={styles.content}>{children}</Content>
      </div>
      <Footer
        style={{
          marginTop: 56,
          height: 586,
          background: '#F0F4FA',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 56,
        }}
      >
        <Flex vertical style={{ maxWidth: 1200, width: '100%' }} justify="space-between">
          <Flex justify="space-between">
            <Flex vertical>
              <img width={345} height={96} src={Quote} />
              <Typography.Text style={{ paddingLeft: 38 }} disabled>
                Узнавайте о новых книгах раньше всех
              </Typography.Text>
            </Flex>
            <Row gutter={[20, 0]} style={{ width: 300 }}>
              <Col span={12}>
                <Typography.Text>Главная</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text>Правила обмена</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text>О проекте</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text>Частые вопросы</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text>Как это работает</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text>Контакты</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text>Найти книгу</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text>Поддержка</Typography.Text>
              </Col>
            </Row>
          </Flex>
          <img src={FooterBooks} alt="footer" />
        </Flex>
      </Footer>
    </Flex>
  )
}
