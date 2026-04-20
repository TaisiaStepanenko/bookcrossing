import { Card, Flex, Typography } from 'antd'

import { useGetNotification } from '../../api/hooks'
import { Container } from '../../components/common/container'

export const NotificationPage = () => {
  const { data } = useGetNotification()

  console.log(data)

  return (
    <Container>
      <Flex vertical gap="medium" style={{ width: '100%' }}>
        <Typography.Title level={4}>Уведомления</Typography.Title>
        <Typography.Text disabled>2 непрочитанное сообщение</Typography.Text>
        <Card>
          <Flex vertical>
            <Flex gap="small">
              <Typography.Text disabled>Новое сообщение</Typography.Text>
            </Flex>
            <Typography.Text>
              Пользователь Анна Смирнова предложила вам обмен. Перейти в раздел Заявки на обмен, чтобы ознакомиться с
              предложением.{' '}
            </Typography.Text>
            <Typography.Text disabled>26 ноября 2025</Typography.Text>
          </Flex>
        </Card>
      </Flex>
    </Container>
  )
}
