import { Col, Flex, Typography } from 'antd'

import { type Book, BOOK_CONDITION, BOOK_COVER } from '../../api/models'
import { BookStatus } from '../bookStatus'

export const BookInfo = ({ data }: { data: Book }) => (
  <Col span={12}>
    <Flex vertical gap="small">
      <BookStatus status={data.exchangeMethod} />
      <Typography.Title level={2}>{data.name}</Typography.Title>
      <Typography.Text disabled>{data.author}</Typography.Text>

      <Flex justify="space-between">
        <Typography.Text disabled>Состояние</Typography.Text>
        <Typography.Text>{BOOK_CONDITION[data.condition].ru}</Typography.Text>
      </Flex>
      <Flex justify="space-between">
        <Typography.Text disabled>Дефекты</Typography.Text>
        <Typography.Text>{data.defects}</Typography.Text>
      </Flex>
      <Flex justify="space-between">
        <Typography.Text disabled>Жанр</Typography.Text>
        <Typography.Text>{data.genre.join(', ')}</Typography.Text>
      </Flex>
      <Flex justify="space-between">
        <Typography.Text disabled>Тип обложки</Typography.Text>
        <Typography.Text>{BOOK_COVER[data.cover].ru}</Typography.Text>
      </Flex>
      <Flex justify="space-between">
        <Typography.Text disabled>Издательство</Typography.Text>
        <Typography.Text>{data.publisherHouse}</Typography.Text>
      </Flex>
      <Flex justify="space-between">
        <Typography.Text disabled>Год издания</Typography.Text>
        <Typography.Text>{data.year}</Typography.Text>
      </Flex>
      <Flex justify="space-between">
        <Typography.Text disabled>Серия</Typography.Text>
        <Typography.Text>{data.series}</Typography.Text>
      </Flex>
    </Flex>
  </Col>
)
