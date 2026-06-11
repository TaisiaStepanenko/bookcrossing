import { useNavigate } from 'react-router-dom'

import { HeartOutlined, StarOutlined, UserOutlined } from '@ant-design/icons'

import { Avatar, Button, Card, Col, Divider, Flex, Typography } from 'antd'
import dayjs from 'dayjs'

import { useAddFavorite, useDeleteBook, useRemoveFavorite } from '../../api/hooks'
import type { Book } from '../../api/models'
import notificationIcon from '../../assets/star-04.png'

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
    <Col span={7} style={{ maxWidth: 320 }}>
      <Flex gap="middle" vertical>
        <Card style={{ borderRadius: 20 }} styles={{ body: { padding: '32px 17px' } }}>
          {!isMy && (
            <Flex vertical style={{ gap: 20, marginBottom: 20 }}>
              <Flex vertical gap="small">
                <Typography.Title level={3}>Хотите эту книгу?</Typography.Title>
                <Typography.Text style={{ fontSize: 16 }}>{getBookText}</Typography.Text>
              </Flex>
              <Flex gap="small">
                <Button
                  color="default"
                  variant="solid"
                  style={{ padding: '12px 32px', height: 45 }}
                  onClick={() => setOpen(true)}
                >
                  {data.exchangeType === 'FREE' ? 'Запросить книгу' : 'Предложить обмен'}
                </Button>
                <Button
                  shape="circle"
                  icon={<HeartOutlined />}
                  style={{
                    width: 45,
                    height: 45,
                    border: '2px solid #69995D',
                    color: '#69995D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={handleFavorite}
                  className="favorite-btn"
                />
              </Flex>
              <Divider style={{ borderTopColor: '#D1D1D1', borderTopWidth: '1px', margin: 0 }} />
            </Flex>
          )}
          <Flex vertical gap="small">
            <Typography.Text strong style={{ fontSize: 16 }}>
              Способ получения:{' '}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 16 }}>{data.obtainingMethod}</Typography.Text>
          </Flex>
        </Card>
        <Card style={{ borderRadius: 20 }}>
          {isMy ? (
            <Flex gap="small" vertical>
              <Button
                color="default"
                variant="solid"
                style={{ padding: '12px 32px', height: 45 }}
                onClick={() => navigate(`/book/edit/${bookId}`)}
              >
                Редактировать
              </Button>
              <Button color="default" style={{ padding: '12px 32px', height: 45 }} onClick={() => onDelete()}>
                Удалить
              </Button>
            </Flex>
          ) : (
            <Flex gap="small" vertical>
              <Flex gap="small" align="center" onClick={() => navigate(`/profile/user/${userInfo.userId}`)}>
                <Avatar size={48} icon={<UserOutlined />} src={`${process.env.VITE_API_URL}${userInfo.avatar}`} />
                <Typography.Text strong style={{ fontSize: 16 }}>
                  {userInfo.name}
                </Typography.Text>
              </Flex>
              <Flex gap="small" style={{ alignItems: 'center' }}>
                <img src={notificationIcon} alt="new" width={16} height={16} />
                <Typography.Text style={{ fontSize: 15, fontWeight: 500 }}>({userInfo.raiting})</Typography.Text>

                <span
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'currentColor',
                    display: 'inline-block',
                  }}
                />
                <Typography.Text style={{ fontSize: 15, fontWeight: 500 }}>
                  {userInfo.reviewNumber} отзывов
                </Typography.Text>
              </Flex>
              <Typography.Text disabled style={{ fontSize: 15, fontWeight: 500, color: '#7D8B9B' }}>
                На сайте с {dayjs(new Date(userInfo.registrationDate)).format('DD.MM.YYYY')}
              </Typography.Text>
            </Flex>
          )}
        </Card>
      </Flex>
    </Col>
  )
}
