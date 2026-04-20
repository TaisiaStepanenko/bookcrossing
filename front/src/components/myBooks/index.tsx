import { useState } from 'react'

import { Col, Pagination, Row } from 'antd'

import { useGetBooks } from '../../api/hooks'
import { BookCard } from '../bookCard'

export const MyBooks = ({ isFavorite }: { isFavorite: boolean }) => {
  const [page, setPage] = useState(1)
  const { data } = useGetBooks(isFavorite ? { favorite: true, page } : { myBook: true, page })

  return (
    <Row gutter={[20, 20]} style={{ width: '100%', marginLeft: 20 }}>
      {data?.items.map((item) => (
        <Col xs={8} key={item.id}>
          <BookCard item={item} />
        </Col>
      ))}
      <Col span={24}>
        <Pagination
          showSizeChanger={false}
          current={data?.page}
          total={(data?.totalPages || 1) * 12}
          pageSize={12}
          onChange={(page) => setPage(page)}
        />
      </Col>
    </Row>
  )
}
