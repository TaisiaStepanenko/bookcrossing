import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Breadcrumb, Col, Flex, Row, Spin, Typography } from 'antd'
import dayjs from 'dayjs'

import { useGetBook } from '../../api/hooks.ts'
import { BookCard } from '../../components/bookCard/index.tsx'
import { BookDeliveryInfo } from '../../components/bookDeliveryInfo.tsx'
import { BookInfo } from '../../components/bookInfo'
import { Container } from '../../components/common/container'
import { ExchangeWithModal } from '../../components/exhange/index.tsx'
import { PhotoGallery } from '../../components/photoGallery/index.tsx'

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
    <Container>
      <Flex style={{ gap: 24, width: '100%' }} vertical>
        <Breadcrumb
          separator=">"
          items={[{ title: 'Глвная', href: '/' }, { title: 'Каталог', href: '/catalog' }, { title: 'Книга' }]}
        />
        <Row style={{ width: '100%' }} gutter={20}>
          <Col span={6}>
            <PhotoGallery photos={data?.photos || []} />
          </Col>
          <BookInfo data={data} />
          <BookDeliveryInfo data={data} setOpen={setOpen} />
        </Row>
        <Typography.Title level={5}>Описание</Typography.Title>
        <Typography.Text>{data.description}</Typography.Text>
        <Typography.Text disabled>{dayjs(new Date(data.registrationDate)).format('DD.MM.YYYY')}</Typography.Text>
        {!data.isMy && (
          <>
            <Typography.Title level={5}>Другие предложения пользователя</Typography.Title>
            <Flex gap={'middle'}>
              {data.otherBooks.map((item) => (
                <BookCard item={item} key={item.id} />
              ))}
            </Flex>
          </>
        )}
      </Flex>
      <ExchangeWithModal
        open={open}
        setOpen={setOpen}
        book={{ id: data.bookId, name: data.name, url: firstPhotoUrl, exchangeType: data.exchangeType }}
      />
    </Container>
  )
}
