import { useNavigate } from 'react-router-dom'

import { HeartOutlined, StarOutlined, UserOutlined } from '@ant-design/icons'

import { Avatar, Button, Card, Col, Divider, Flex, Typography } from 'antd'
import dayjs from 'dayjs'

import { useAddFavorite, useDeleteBook, useRemoveFavorite } from '../../api/hooks'
import type { Book } from '../../api/models'

export const BookDeliveryInfo = ({ data, setOpen }: { data: Book; setOpen: (open: boolean) => void }) => {
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const navigate = useNavigate()
  const { mutateAsync } = useDeleteBook()

  const { userInfo, isMy, bookId } = data
  const getBookText =
    data.exchangeMethod === 'MEETING'
      ? `Заберите у ${data.userInfo.shortName} в ${userInfo.city}`
      : data.exchangeMethod === 'DELIVERY'
        ? 'Получите почтой'
        : `Заберите у ${data.userInfo.shortName} в ${userInfo.city} или получите почтой`

  const onDelete = () => {
    mutateAsync({ id: data.bookId }).finally(() => navigate('/catalog'))
  }

  const handleFavorite = () => {
    if (data.isFavorite) {
      removeFavorite.mutateAsync(data.bookId)
    } else {
      addFavorite.mutateAsync(data.bookId)
    }
  }

  console.log(userInfo)

  return (
    <Col span={6}>
      <Flex gap="small" vertical>
        <Card>
          {!isMy && (
            <>
              <Flex vertical gap="small">
                <Typography.Title level={3}>Хотите эту книгу?</Typography.Title>
                <Typography.Text>{getBookText}</Typography.Text>
                <Flex gap="small">
                  <Button color="default" variant="solid" onClick={() => setOpen(true)}>
                    {data.exchangeType === 'FREE' ? 'Запросить книгу' : 'Предложить обмен'}
                  </Button>
                  <Button color="default" variant="text" icon={<HeartOutlined />} onClick={handleFavorite} />
                </Flex>
              </Flex>
              <Divider />
            </>
          )}
          <Flex vertical gap="small">
            <Typography.Text strong>Способ получения: </Typography.Text>
            <Typography.Text>{data.obtainingMethod}</Typography.Text>
          </Flex>
        </Card>
        <Card>
          {isMy ? (
            <Flex gap="small" vertical>
              <Button color="default" variant="solid" onClick={() => navigate(`/book/edit/${bookId}`)}>
                Редактировать
              </Button>
              <Button color="default" variant="outlined" onClick={() => onDelete()}>
                Удалить
              </Button>
            </Flex>
          ) : (
            <Flex gap="small" vertical>
              <Flex gap="small" align="center" onClick={() => navigate(`/profile/user/${userInfo.userId}`)}>
                <Avatar size={48} icon={<UserOutlined />} src={`${import.meta.env.VITE_API_URL}${userInfo.avatar}`} />
                <Typography.Text strong>{userInfo.name}</Typography.Text>
              </Flex>
              <Flex gap="middle">
                <Flex gap="small">
                  <StarOutlined />
                  <Typography.Text strong>({userInfo.raiting})</Typography.Text>
                </Flex>
                <Flex gap="small">
                  <Typography.Text strong>{userInfo.reviewNumber} отзывов</Typography.Text>
                </Flex>
              </Flex>
              <Typography.Text disabled>
                На сайте с {dayjs(new Date(userInfo.registrationDate)).format('DD.MM.YYYY')}
              </Typography.Text>
            </Flex>
          )}
        </Card>
      </Flex>
    </Col>
  )
}
