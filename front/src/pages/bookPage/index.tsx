import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Breadcrumb, Col, Flex, Row, Spin, Typography } from 'antd'
import dayjs from 'dayjs'

import { useGetBook } from '../../api/hooks'
import { BookCard } from '../../components/bookCard'
import { BookDeliveryInfo } from '../../components/bookDeliveryInfo.tsx'
import { BookInfo } from '../../components/bookInfo'
import { Container } from '../../components/common/container'
import { ExchangeWithModal } from '../../components/exhange'
import { PhotoGallery } from '../../components/photoGallery'

export const BookPage = () => {
  const [open, setOpen] = useState(false)
  const params = useParams()

  const bookId = Number(params?.id)
  const { data, isLoading } = useGetBook(isNaN(bookId) ? 0 : bookId)

  if (isLoading || !data)
    return (
      <Flex justify="center" align="center">
        <Spin />
      </Flex>
    )

  const firstPhotoUrl = data.photos?.[0]?.url || ''

  return (
    <Container fullHeight={false}>
      <Flex style={{ width: '100%' }} vertical>
        <Breadcrumb
          style={{ fontSize: 16, marginBottom: 32 }}
          separator=">"
          items={[{ title: 'Главная', href: '/' }, { title: 'Каталог', href: '/catalog' }, { title: `${data.name}` }]}
        />
        <Flex vertical gap={64}>
          <Flex
            style={{
              gap: 40,
            }}
          >
            <Col span={7} style={{ maxWidth: 320 }}>
              <PhotoGallery photos={data?.photos || []} />
            </Col>
            <BookInfo data={data} />
            <BookDeliveryInfo data={data} setOpen={setOpen} />
          </Flex>
          {data.description && (
            <Flex vertical gap={20}>
              <Typography.Title level={5} style={{ fontWeight: 600 }}>
                Описание
              </Typography.Title>
              <Typography.Text style={{ fontSize: 16 }}>{data.description}</Typography.Text>
              <Typography.Text disabled style={{ fontSize: 16, color: '#7D8B9B' }}>
                {dayjs(new Date(data.registrationDate)).format('DD.MM.YYYY')}
              </Typography.Text>
            </Flex>
          )}
          {!data.isMy && (
            <Flex vertical gap={20}>
              <Typography.Title level={5} style={{ fontWeight: 600 }}>
                Другие предложения пользователя
              </Typography.Title>
              <Flex gap={'middle'}>
                {data.otherBooks.map((item) => (
                  <BookCard item={item} key={item.id} />
                ))}
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
      <ExchangeWithModal
        open={open}
        setOpen={setOpen}
        book={{ id: data.bookId, name: data.name, url: firstPhotoUrl, exchangeType: data.exchangeType }}
      />
    </Container>
  )
}
