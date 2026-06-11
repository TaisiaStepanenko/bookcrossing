import { Col, Flex, Typography } from 'antd'

import { type Book, BOOK_CONDITION, BOOK_COVER } from '../../api/models'
import { BookStatus } from '../bookStatus'

import styles from './BookInfo.module.scss'

export const BookInfo = ({ data }: { data: Book }) => (
  <Col span={10} style={{ maxWidth: 480 }}>
    <Flex vertical gap={4} className={styles.bookInfo}>
      <BookStatus exchangeType={data.exchangeType} exchangeMethod={data.exchangeMethod} />{' '}
      <Typography.Title level={2} style={{ marginTop: 4 }}>
        {data.name}
      </Typography.Title>
      <Typography.Text disabled style={{ marginBottom: 36, fontSize: 16, color: '#7D8B9B' }}>
        {data.author}
      </Typography.Text>
      <Flex justify="space-between" className={styles.infoRow}>
        <Typography.Text disabled style={{ fontSize: 16, color: '#7D8B9B' }}>
          Состояние
        </Typography.Text>
        <Typography.Text style={{ fontSize: 16 }}>{BOOK_CONDITION[data.condition].ru}</Typography.Text>
      </Flex>
      {data.defects && (
        <Flex justify="space-between" className={styles.infoRow}>
          <Typography.Text disabled style={{ fontSize: 16, color: '#7D8B9B' }}>
            Дефекты
          </Typography.Text>
          <Typography.Text style={{ fontSize: 16 }}>{data.defects}</Typography.Text>
        </Flex>
      )}
      <Flex justify="space-between" className={styles.infoRow}>
        <Typography.Text disabled style={{ fontSize: 16, color: '#7D8B9B' }}>
          Жанр
        </Typography.Text>
        <Typography.Text style={{ fontSize: 16 }}>{data.genre.join(', ')}</Typography.Text>
      </Flex>
      <Flex justify="space-between" className={styles.infoRow}>
        <Typography.Text disabled style={{ fontSize: 16, color: '#7D8B9B' }}>
          Тип обложки
        </Typography.Text>
        <Typography.Text style={{ fontSize: 16 }}>{BOOK_COVER[data.cover].ru}</Typography.Text>
      </Flex>
      {data.publisherHouse && (
        <Flex justify="space-between" className={styles.infoRow}>
          <Typography.Text disabled style={{ fontSize: 16, color: '#7D8B9B' }}>
            Издательство
          </Typography.Text>
          <Typography.Text style={{ fontSize: 16 }}>{data.publisherHouse}</Typography.Text>
        </Flex>
      )}
      {data.year && (
        <Flex justify="space-between" className={styles.infoRow}>
          <Typography.Text disabled style={{ fontSize: 16, color: '#7D8B9B' }}>
            Год издания
          </Typography.Text>
          <Typography.Text style={{ fontSize: 16 }}>{data.year}</Typography.Text>
        </Flex>
      )}
      {data.series && (
        <Flex justify="space-between" className={styles.infoRow}>
          <Typography.Text disabled style={{ fontSize: 16, color: '#7D8B9B' }}>
            Серия
          </Typography.Text>
          <Typography.Text style={{ fontSize: 16 }}>{data.series}</Typography.Text>
        </Flex>
      )}
    </Flex>
  </Col>
)
