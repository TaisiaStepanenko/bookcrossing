import { useNavigate } from 'react-router-dom'

import { StarFilled, StarOutlined } from '@ant-design/icons'

import { Avatar, Button, Card, Col, Divider, Flex, Image, Rate, Row, Typography } from 'antd'

import { useGetCities, useGetProfile } from '../../api/hooks'
import StarIcon from '../../assets/icons/star-04.png'
import UserImg from '../../assets/userD.jpg'
import { BookCard } from '../bookCard'

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
    userBooks,
  } = query.data || {}

  const getAge = (birthdayDate: string): number => {
    const today = new Date()
    const birth = new Date(birthdayDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  return (
    <Flex vertical gap="small" style={{ width: '100%', gap: 40 }}>
      <Flex gap={'large'} style={{ width: '100%' }} justify="space-between">
        <Row gutter={[40, 40]} align="top" style={{ width: '100%', marginInline: 0, gap: 40 }}>
          <Col span={id ? 20 : 24} style={{ maxWidth: 875, padding: 0 }}>
            <Flex gap={40} style={{ width: '100%' }}>
              <Flex vertical gap={18}>
                <Image width={285} height={285} src={photo ? `${process.env.VITE_API_URL}${photo}` : UserImg} />
                {!id && (
                  <Button
                    type="primary"
                    color="primary"
                    style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
                    onClick={() => navigate('/profile/edit')}
                  >
                    Редактировать профиль
                  </Button>
                )}
              </Flex>

              <Flex vertical gap={40} style={{ width: '100%', maxWidth: 550 }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {name}
                </Typography.Title>

                <Flex vertical gap={4}>
                  {!id ? (
                    <Flex justify="space-between" style={{ minHeight: 35, alignItems: 'center' }}>
                      <Typography.Text disabled>Дата рождения</Typography.Text>
                      {birthdayDate && <Typography.Text>{new Date(birthdayDate).toLocaleDateString()}</Typography.Text>}
                    </Flex>
                  ) : (
                    <Flex justify="space-between" style={{ minHeight: 35, alignItems: 'center' }}>
                      <Typography.Text disabled>Возраст</Typography.Text>
                      {birthdayDate && <Typography.Text>{getAge(birthdayDate)} лет</Typography.Text>}
                    </Flex>
                  )}
                  <Flex justify="space-between" style={{ minHeight: 35, alignItems: 'center' }}>
                    <Typography.Text disabled>Место проживания</Typography.Text>
                    <Typography.Text>{cities?.find((val) => val.cityId === cityId)?.name}</Typography.Text>
                  </Flex>
                  <Flex justify="space-between" style={{ minHeight: 35, alignItems: 'center' }}>
                    <Typography.Text disabled>Электронная почта</Typography.Text>
                    <Typography.Text>{email}</Typography.Text>
                  </Flex>
                  {phone && (
                    <Flex justify="space-between" style={{ minHeight: 35, alignItems: 'center' }}>
                      <Typography.Text disabled>Номер телефона</Typography.Text>
                      <Typography.Text>{phone}</Typography.Text>
                    </Flex>
                  )}
                  <Flex justify="space-between" style={{ minHeight: 35, alignItems: 'center' }}>
                    <Typography.Text disabled>Дата регистрации</Typography.Text>
                    {registrationDate && (
                      <Typography.Text>{new Date(registrationDate).toLocaleDateString()}</Typography.Text>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Col>
          {id && (
            <Col span={4} style={{ maxWidth: '285px', paddingInline: 0 }}>
              <Card style={{ width: 285, height: 177, borderRadius: 20 }} styles={{ body: { padding: '32px 24px' } }}>
                <Flex vertical gap={16}>
                  <Typography.Title level={3}>Действия на сайте</Typography.Title>
                  <Flex justify="space-between" gap={46} style={{ alignItems: 'center' }}>
                    <Typography.Text disabled style={{ width: 172 }}>
                      Завершённые обмены
                    </Typography.Text>
                    <Typography.Text style={{ width: 19, textAlign: 'end' }}>{completedExchanges}</Typography.Text>
                  </Flex>
                  <Flex justify="space-between" gap={46} style={{ alignItems: 'center' }}>
                    <Typography.Text disabled style={{ width: 172 }}>
                      Книги пользователя доступные к обмену
                    </Typography.Text>
                    <Typography.Text style={{ width: 19, textAlign: 'end' }}>{availableBooks}</Typography.Text>
                  </Flex>
                </Flex>
              </Card>
            </Col>
          )}
        </Row>
      </Flex>
      <Card style={{ width: '100%', height: 'auto', borderRadius: 20 }}>
        <Flex vertical gap={'small'}>
          <Typography.Title level={3}>О себе</Typography.Title>
          <Typography.Text>{description}</Typography.Text>
        </Flex>
      </Card>
      {id && userBooks && userBooks.length > 0 && (
        <Flex vertical gap={20}>
          <Typography.Title level={5}>Книги пользователя</Typography.Title>
          <Flex wrap="wrap" gap="middle">
            {userBooks.map((book) => (
              <BookCard item={book} />
            ))}
          </Flex>
        </Flex>
      )}
      <Flex vertical gap={20}>
        <Typography.Title level={5}>Рейтинг и отзывы</Typography.Title>
        <Flex gap="middle">
          <Flex gap="small" style={{ alignItems: 'center' }}>
            <img src={StarIcon} alt="new" width={22} height={22} />
            <Typography.Text style={{ fontSize: 18, fontWeight: 500 }}>({Number(rating).toFixed(1)})</Typography.Text>
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'currentColor',
                display: 'inline-block',
              }}
            />
            <Typography.Text style={{ fontSize: 18, fontWeight: 500 }}>{reviews?.length} отзывов</Typography.Text>
          </Flex>
        </Flex>
        <Flex vertical gap={39}>
          {reviews?.map((review: any, index: number) => (
            <Flex vertical gap={20}>
              <Flex gap={'small'} align="center" key={review.review_id}>
                <Avatar
                  style={{ width: 48, height: 48 }}
                  src={
                    review.reviewerInfo.photo ? `${process.env.VITE_API_URL}${review.reviewerInfo.photo}` : undefined
                  }
                >
                  {review.reviewerInfo.name?.[0] || '?'}
                </Avatar>
                <Typography.Text strong>{review.reviewerInfo.name}</Typography.Text>
              </Flex>

              <Flex gap={'small'} align="center">
                <Rate
                  disabled
                  defaultValue={review.rating}
                  allowHalf
                  style={{ fontSize: 18 }}
                  character={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 29 29"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ display: 'block', marginRight: -6, gap: 0 }}
                    >
                      <path d="M14.5013 26.5833L12.0702 20.2624C11.7294 19.3764 11.559 18.9334 11.2941 18.5608C11.0593 18.2305 10.7707 17.942 10.4405 17.7072C10.0678 17.4422 9.62485 17.2718 8.73886 16.9311L2.41797 14.5L8.73886 12.0688C9.62485 11.7281 10.0678 11.5577 10.4405 11.2927C10.7707 11.0579 11.0593 10.7694 11.2941 10.4391C11.559 10.0665 11.7294 9.62351 12.0702 8.73752L14.5013 2.41663L16.9324 8.73752C17.2732 9.62351 17.4436 10.0665 17.7085 10.4391C17.9433 10.7694 18.2319 11.0579 18.5621 11.2927C18.9348 11.5577 19.3778 11.7281 20.2637 12.0688L26.5846 14.5L20.2637 16.9311C19.3778 17.2718 18.9348 17.4422 18.5621 17.7072C18.2319 17.942 17.9433 18.2305 17.7085 18.5608C17.4436 18.9334 17.2732 19.3764 16.9324 20.2624L14.5013 26.5833Z" />
                    </svg>
                  }
                />
                <Typography.Text style={{ fontSize: 15 }}>({Number(review.rating)})</Typography.Text>
              </Flex>
              <Typography.Text>{review.comment}</Typography.Text>
              <Typography.Text style={{ color: '#7D8B9B' }}>
                {' '}
                {new Date(review.reviewDate).toLocaleDateString()}{' '}
              </Typography.Text>
              {index !== reviews.length - 1 && (
                <Divider style={{ borderTopColor: '#D9D9D9', borderTopWidth: '1px', marginBlock: 20 }} />
              )}
            </Flex>
          ))}
          {(!reviews || reviews.length === 0) && <Typography.Text disabled>Нет отзывов</Typography.Text>}
        </Flex>
      </Flex>
    </Flex>
  )
}
