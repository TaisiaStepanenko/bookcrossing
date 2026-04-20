import { useNavigate } from 'react-router-dom'

import { BellOutlined, EnvironmentOutlined, HeartOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'

import { Button, Col, Flex, Grid, Input, Layout, Row, Space, Typography } from 'antd'

import Logo from '../../../assets/logo.png'
import { useUserStore } from '../../../store/user'

import styles from './style.module.scss'

const { Header, Content, Footer } = Layout
const { Text, Title } = Typography
const { useBreakpoint } = Grid

export const Container = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()

  const user = useUserStore((store) => store.user)

  return (
    <div className={styles.container}>
      <Header className={styles.header}>
        {/* Logo and location */}
        <div>
          <img src={Logo} />
          {/* {screens.sm && (
              <Space size={4} className="text-text-secondary">
                <EnvironmentOutlined className="text-text-muted" />
                <Text type="secondary" className="text-xs">
                  г. Москва
                </Text>
              </Space>
            )} */}
        </div>

        <div>
          <Input
            placeholder="Я ищу…"
            prefix={<SearchOutlined className="text-text-muted" />}
            className="max-w-xl rounded-full"
            size="middle"
            styles={{
              input: {
                borderRadius: '9999px',
              },
              affixWrapper: {
                borderRadius: '9999px',
              },
            }}
          />
        </div>

        {/* Actions */}
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
            <Button
              type="text"
              className="text-text-secondary hover:text-text-primary"
              onClick={() => navigate('/login')}
            >
              Войти
            </Button>
          )}
        </Space>
      </Header>

      <Content className={styles.content}>{children}</Content>

      <Footer className="bg-[#EEF3FA] mt-auto p-0">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
          <Row gutter={[40, 40]} align="top">
            {/* Left column - Quote and newsletter */}
            <Col xs={24} lg={12}>
              <div className="flex items-start gap-3">
                <Text className="text-4xl font-bold leading-none text-[#5B87E8]">“</Text>
                <div>
                  <Title level={3} className="!text-3xl !font-semibold !leading-tight !mb-2">
                    Книга вечна,
                    <br />
                    пока её читают
                  </Title>
                  <Text type="secondary" className="text-sm block mt-2">
                    Узнавайте о новых книгах раньше всех
                  </Text>

                  <Space className="mt-5 max-w-md w-full">
                    <Input placeholder="Введите e-mail" type="email" className="flex-1" size="middle" />
                    <Button type="primary" className="bg-[#5B87E8] rounded-full hover:bg-[#4F79D3]">
                      Подписаться
                    </Button>
                  </Space>
                </div>
              </div>
            </Col>

            {/* Right column - Navigation links */}
            <Col xs={24} lg={12}>
              <Row gutter={[40, 24]}>
                <Col xs={12}>
                  <div className="space-y-3">
                    <Text strong className="block">
                      Главная
                    </Text>
                    <div className="space-y-2">
                      <Text type="secondary" className="block text-sm">
                        О проекте
                      </Text>
                      <Text type="secondary" className="block text-sm">
                        Как это работает
                      </Text>
                      <Text type="secondary" className="block text-sm">
                        Найти книгу
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="space-y-3">
                    <Text strong className="block">
                      Правила обмена
                    </Text>
                    <div className="space-y-2">
                      <Text type="secondary" className="block text-sm">
                        Частые вопросы
                      </Text>
                      <Text type="secondary" className="block text-sm">
                        Контакты
                      </Text>
                      <Text type="secondary" className="block text-sm">
                        Поддержка
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Decorative footer */}
          <div className="mt-10">
            <div className="h-[120px] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#DCE8FF] via-[#EEF3FA] to-[#DCE8FF]">
              <svg className="h-full w-full" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
                <rect width="1200" height="120" fill="transparent" />
                <g transform="translate(60,18)">
                  <rect x="0" y="22" width="70" height="80" rx="6" fill="#3B82F6" opacity="0.25" />
                  <rect x="85" y="12" width="70" height="90" rx="6" fill="#0EA5E9" opacity="0.25" />
                  <rect x="170" y="32" width="70" height="70" rx="6" fill="#84CC16" opacity="0.25" />
                  <rect x="255" y="18" width="20" height="84" rx="6" fill="#F97316" opacity="0.28" />
                  <rect x="285" y="10" width="70" height="92" rx="6" fill="#6366F1" opacity="0.22" />
                  <rect x="370" y="26" width="70" height="76" rx="6" fill="#EF4444" opacity="0.20" />
                </g>

                <g transform="translate(860,26)">
                  <rect x="0" y="20" width="160" height="72" rx="10" fill="#FFFFFF" opacity="0.9" />
                  <text x="80" y="55" textAnchor="middle" fontSize="18" fill="#111827" fontWeight="700">
                    РУКИ
                  </text>
                  <text x="80" y="78" textAnchor="middle" fontSize="12" fill="#6B7280">
                    © 2026
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </Footer>
    </div>
  )
}
