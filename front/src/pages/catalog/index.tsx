import { useEffect, useState } from 'react'

import { Card, Checkbox, Col, Flex, Pagination, Row, Typography } from 'antd'

import { useGetBooks } from '../../api/hooks'
import { BOOK_CONDITION, type BooksFilters, EXCHANGE_TYPE, PLACES } from '../../api/models'
import { BookCard } from '../../components/bookCard'
import { Container } from '../../components/common/container'
import { useUserStore } from '../../store/user'
import { conditionOptions, exchangeTypeOptions, placeOptions } from './consts'

export const CatalogPage = () => {
  const cityId = useUserStore((state) => state.user?.cityId)

  console.log(cityId)

  const [filters, setFilters] = useState<BooksFilters>({ page: 0, place: ['RUSSIA'] })
  const { data } = useGetBooks({ ...filters, cityId })

  const toggleFilter = <T extends string>(current: T[] | undefined, value: T): T[] => {
    if (current?.includes(value)) {
      return current.filter((v) => v !== value)
    }

    return [...(current || []), value]
  }

  return (
    <Container>
      <div style={{ minHeight: '100%', width: '100%' }}>
        <Typography.Title>Каталог</Typography.Title>
        <Flex>
          <Flex style={{ width: 285, height: 595 }}>
            <Card>
              <Flex vertical>
                <Flex vertical>
                  <Typography.Title level={3}>Где искать</Typography.Title>
                  {placeOptions.map(({ value, label }) => (
                    <Checkbox
                      key={value}
                      checked={filters.place?.includes(value)}
                      onChange={() =>
                        setFilters({
                          ...filters,
                          place: toggleFilter(filters.place, value),
                        })
                      }
                    >
                      {label}
                    </Checkbox>
                  ))}

                  <Typography.Title level={3}>Способ получения</Typography.Title>
                  {exchangeTypeOptions.map(({ value, label }) => (
                    <Checkbox
                      key={value}
                      checked={filters.exchange?.includes(value)}
                      onChange={() =>
                        setFilters({
                          ...filters,
                          exchange: toggleFilter(filters.exchange, value),
                        })
                      }
                    >
                      {label}
                    </Checkbox>
                  ))}

                  <Typography.Title level={3}>Состояние книги</Typography.Title>
                  {conditionOptions.map(({ value, label }) => (
                    <Checkbox
                      key={value}
                      checked={filters.condition?.includes(value)}
                      onChange={() =>
                        setFilters({
                          ...filters,
                          condition: toggleFilter(filters.condition, value),
                        })
                      }
                    >
                      {label}
                    </Checkbox>
                  ))}
                </Flex>
              </Flex>
            </Card>
          </Flex>
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
                onChange={(page) => setFilters({ ...filters, cityId, page })}
              />
            </Col>
          </Row>
        </Flex>
      </div>
    </Container>
  )
}
