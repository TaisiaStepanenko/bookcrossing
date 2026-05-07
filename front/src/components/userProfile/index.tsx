import { useNavigate } from 'react-router-dom'

import { StarFilled, StarOutlined } from '@ant-design/icons'

import { Avatar, Button, Card, Col, Flex, Image, Rate, Row, Typography } from 'antd'

import { useGetCities, useGetProfile } from '../../api/hooks'
import UserImg from '../../assets/userD.jpg'

export const UserProfile = ({ id }: { id?: string }) => {
  const query = useGetProfile(id || '')
  const { data: cities } = useGetCities()
  const navigate = useNavigate()
  const {
    name,
    availableBooks,
    birthdayDate,
    cityId,
    completedExchanges,
    description,
    email,
    phone,
    rating,
    registrationDate,
    reviews,
    photo,
  } = query.data || {}

  return (
    <Flex vertical gap="small" style={{ width: '100%' }}>
      <Flex gap={'large'} style={{ width: '100%' }} justify="space-between">
        <Row gutter={[40, 40]} align="top" style={{ width: '100%' }}>
          <Col span={id ? 20 : 24}>
            <Flex gap={'large'} style={{ width: '100%' }}>
              <Flex vertical gap={'small'}>
                <Image width={285} height={285} src={photo ? `${import.meta.env.VITE_API_URL}${photo}` : UserImg} />
                <Button color="default" variant="solid" onClick={() => navigate('/profile/edit')}>
                  Редактировать профиль
                </Button>
              </Flex>

              <Flex vertical gap={'large'} style={{ width: '100%' }}>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {name}
                </Typography.Title>
                <Flex justify="space-between">
                  <Typography.Text disabled>Дата рождения</Typography.Text>
                  {birthdayDate && <Typography.Text>{new Date(birthdayDate).toLocaleDateString()}</Typography.Text>}
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text disabled>Место проживания</Typography.Text>
                  <Typography.Text>{cities?.find((val) => val.cityId === cityId)?.name}</Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text disabled>Электронная почта</Typography.Text>
                  <Typography.Text>{email}</Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text disabled>Номер телефона</Typography.Text>
                  <Typography.Text>{phone}</Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text disabled>Дата регистрации</Typography.Text>
                  {registrationDate && (
                    <Typography.Text>{new Date(registrationDate).toLocaleDateString()}</Typography.Text>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Col>
          {id && (
            <Col span={4}>
              <Card style={{ width: '100%' }}>
                <Typography.Title level={5}>Действия на сайте</Typography.Title>
                <Flex justify="space-between">
                  <Typography.Text disabled>Завершённые обмены</Typography.Text>
                  <Typography.Text>{completedExchanges}</Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text disabled>Книги пользователя доступные к обмену</Typography.Text>
                  <Typography.Text>{availableBooks}</Typography.Text>
                </Flex>
              </Card>
            </Col>
          )}
        </Row>
      </Flex>
      <Card>
        <Flex vertical gap={'small'}>
          <Typography.Title level={4}>О себе</Typography.Title>
          <Typography.Text>{description}</Typography.Text>
        </Flex>
      </Card>
      <Typography.Title level={3}>Рейтинг и отзывы</Typography.Title>
      <Flex gap="middle">
        <Flex gap="small">
          <StarOutlined />
          <Typography.Text strong>({rating})</Typography.Text>
        </Flex>
        <Flex gap="small">
          <Typography.Text strong>{reviews?.length} отзывов</Typography.Text>
        </Flex>
      </Flex>
      <Flex vertical gap={'middle'}>
        {reviews?.map((review: any) => (
          <Flex vertical gap={'middle'}>
            <Flex gap={'small'} align="center" key={review.review_id}>
              <Avatar
                src={
                  review.reviewerInfo.photo ? `${import.meta.env.VITE_API_URL}${review.reviewerInfo.photo}` : undefined
                }
              >
                {review.reviewerInfo.name?.[0] || '?'}
              </Avatar>
              <Typography.Text strong>{review.reviewerInfo.name}</Typography.Text>
            </Flex>
            <Flex gap={'small'}>
              <Rate disabled defaultValue={review.rating} allowHalf style={{ fontSize: 14 }} />
              <Typography.Text strong>({review.rating})</Typography.Text>
            </Flex>
            <Typography.Text>{review.comment}</Typography.Text>
            <Typography.Text disabled> {new Date(review.review_date).toLocaleDateString()} </Typography.Text>
          </Flex>
        ))}
        {(!reviews || reviews.length === 0) && <Typography.Text disabled>Нет отзывов</Typography.Text>}
      </Flex>
    </Flex>
  )
}
