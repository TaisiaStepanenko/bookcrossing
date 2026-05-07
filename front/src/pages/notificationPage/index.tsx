import { useNavigate } from 'react-router-dom'

import { Card, Flex, Typography } from 'antd'

import { pluralize } from '../../api/functions'
import { useGetNotification } from '../../api/hooks'
import { Container } from '../../components/common/container'
import { useUserStore } from '../../store/user'

const getNotificationText = (type: string, userName: string) => {
  switch (type) {
    case 'EXCHANGE':
      return `Пользователь ${userName} сделал вам предложение обмена.`
    case 'REVIEW':
      return `Пользователь ${userName} оставил вам отзыв.`
    default:
      return `Пользователь ${userName} обновил заявку.`
  }
}

export const NotificationPage = () => {
  const { data } = useGetNotification()
  const changeProfilePage = useUserStore((store) => store.changeProfilePage)
  const navigate = useNavigate()

  return (
    <Container>
      <Flex vertical gap="medium" style={{ width: '100%' }}>
        <Typography.Title level={4}>Уведомления</Typography.Title>
        <Typography.Text disabled>
          {data?.length} {pluralize(data?.length || 0, ['сообщение', 'сообщений', 'сообщений'])}
        </Typography.Text>

        {data?.map((notification) => (
          <Card key={notification.notificationId}>
            <Flex vertical>
              {!notification.isRead && (
                <Flex gap="small">
                  <Typography.Text disabled>Новое сообщение</Typography.Text>
                </Flex>
              )}
              <Typography.Text>{getNotificationText(notification.messageType, notification.userName)}</Typography.Text>
              {notification.messageType === `EXCHANGE` && (
                <Typography.Link
                  onClick={() => {
                    navigate('/profile')
                    changeProfilePage(`REQUESTS`)
                  }}
                >
                  Перейти к заявке.
                </Typography.Link>
              )}
              {notification.messageType === 'REVIEW' && (
                <Typography.Link
                  onClick={() => {
                    navigate('/profile')
                    changeProfilePage('PROFILE')
                  }}
                >
                  Перейти к отзыву.
                </Typography.Link>
              )}
              <Typography.Text disabled>{new Date(notification.createdAt).toLocaleDateString()}</Typography.Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Container>
  )
}
