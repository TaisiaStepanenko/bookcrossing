import { useNavigate } from 'react-router-dom'

import { Card, Flex, Typography } from 'antd'

import { pluralize } from '../../api/functions'
import { useGetNotification } from '../../api/hooks'
import { Container } from '../../components/common/container'
import { useUserStore } from '../../store/user'

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

        {data?.map((review) => (
          <Card key={review.notificationId}>
            <Flex vertical>
              {!review.isRead && (
                <Flex gap="small">
                  <Typography.Text disabled>Новое сообщение</Typography.Text>
                </Flex>
              )}
              <Typography.Text>
                Пользователь <a href={`/profile/user/${review.userId}`}>{review.userName}</a> изменил{' '}
                <a
                  onClick={() => {
                    navigate('/profile')
                    changeProfilePage('REQUESTS')
                  }}
                >
                  Заявку
                </a>{' '}
                на обмен.
              </Typography.Text>
              <Typography.Text disabled>{new Date(review.createdAt).toLocaleDateString()}</Typography.Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Container>
  )
}
