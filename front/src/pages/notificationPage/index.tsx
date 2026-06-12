import { useNavigate } from 'react-router-dom'

import { Button, Card, Flex, Typography } from 'antd'
import { Color } from 'antd/es/color-picker'

import { pluralize } from '../../api/functions'
import { useGetNotification, useMarkNotificationAsRead } from '../../api/hooks'
import { type Notification } from '../../api/models'
import notificationIcon from '../../assets/star-04.png'
import { Container } from '../../components/common/container'
import { useUserStore } from '../../store/user'

const getNotificationText = (n: Notification): string => {
  const userName = n.userName
  const book = n.bookTitle ? ` "${n.bookTitle}"` : ''

  if (n.messageType === 'REVIEW') {
    if (n.exchangeType === 'FREE') {
      return `Пользователь ${userName} оставил отзыв о дарении книги${book}.`
    } else {
      return `Пользователь ${userName} оставил отзыв об обмене книги${book}.`
    }
  } else if (n.messageType === 'EXCHANGE') {
    if (n.transferStatus === 'CANCELLED' && n.userId) {
      return `Пользователь ${userName} отклонил вашу заявку на книгу${book}.`
    }
    if (n.transferStatus === 'COMPLETED_PREMATURELY') {
      return `Обмен книги${book} досрочно завершён.`
    }
    switch (n.curStutus) {
      case 'NEW':
        if (n.transferStatus === 'WAITING_RESPONSE') {
          return n.exchangeType === 'FREE'
            ? `Пользователь ${userName} хочет получить книгу${book}.`
            : `Пользователь ${userName} предлагает обмен${book}.`
        }

        if (n.transferStatus === 'WAITING_CONFIRMATION') {
          return n.exchangeType === 'FREE'
            ? `Пользователь ${userName} согласен отдать книгу${book}.`
            : `Пользователь ${userName} принял ваше предложение обмена${book}.`
        }
        break
      case 'RUNNING':
        return `Пользователь ${userName} обновил статус обмена книги${book}.`
      case 'ENDED':
        return `Обмен с пользователем ${userName} завершён. Вы можете оставить отзыв.`
    }
  }

  return `Новое уведомление от ${userName}`
}

export const NotificationPage = () => {
  const { data } = useGetNotification()
  const changeProfilePage = useUserStore((store) => store.changeProfilePage)
  const navigate = useNavigate()
  const { mutate: markAsRead } = useMarkNotificationAsRead()

  const handleClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n.notificationId)

    let tab = 'PROFILE'

    if (n.messageType === 'EXCHANGE') {
      switch (n.curStutus) {
        case 'NEW':
          tab = 'REQUESTS'
          break
        case 'RUNNING':
          tab = 'RUNNING_REQUESTS'
          break
        case 'ENDED':
          tab = 'ENDED_REQUESTS'
          break
        default:
          tab = 'REQUESTS'
      }
    } else if (n.messageType === 'REVIEW') {
      tab = 'PROFILE'
    }

    changeProfilePage(tab)
    navigate('/profile')
  }

  return (
    <Container>
      <Flex vertical gap={25} style={{ width: '100%' }}>
        <Flex vertical gap={10}>
          <Typography.Title level={2}>Уведомления</Typography.Title>
          <Typography.Text style={{ color: '#7D8B9B', fontSize: 18 }}>
            {data?.length} {pluralize(data?.length || 0, ['сообщение', 'сообщения', 'сообщений'])}
          </Typography.Text>
        </Flex>

        {data?.map((notification) => (
          <Card
            style={{ width: '100%', height: 'auto', borderRadius: 20 }}
            key={notification.notificationId}
            onClick={() => markAsRead(notification.notificationId)}
          >
            <Flex vertical gap={20}>
              {!notification.isRead && (
                <Flex gap={4} align="center">
                  <img src={notificationIcon} alt="new" width={19} height={19} />
                  <Typography.Text style={{ color: '#7D8B9B' }}>Новое сообщение</Typography.Text>
                </Flex>
              )}
              <Flex vertical gap={'small'}>
                <Typography.Text>{getNotificationText(notification)}</Typography.Text>
                {notification.messageType === `EXCHANGE` && (
                  <Typography.Link
                    onClick={() => {
                      handleClick(notification)
                    }}
                  >
                    Перейти к заявке.
                  </Typography.Link>
                )}
              </Flex>
              {notification.messageType === 'REVIEW' && (
                <Typography.Link
                  onClick={() => {
                    handleClick(notification)
                  }}
                >
                  Перейти к отзыву.
                </Typography.Link>
              )}
              <Typography.Text style={{ color: '#7D8B9B' }}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </Typography.Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Container>
  )
}
