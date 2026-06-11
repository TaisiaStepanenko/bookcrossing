import { useEffect, useState } from 'react'

import { Card, Checkbox, Col, Flex, message, Pagination, Row, Typography } from 'antd'

import { useGetBooks, useGetCities } from '../../api/hooks'
import { type BooksFilters, PLACES } from '../../api/models'
import { BookCard } from '../../components/bookCard'
import { Container } from '../../components/common/container'
import { CustomSelect } from '../../components/ui/Select'
import { useUserStore } from '../../store/user'
import { conditionOptions, exchangeTypeOptions, placeOptions } from './consts'

export const CatalogPage = () => {
  const searchCity = useUserStore((state) => state.searchCity)
  const search = useUserStore((state) => state.search)

  const [filters, setFilters] = useState<BooksFilters>({ page: 1, place: ['RUSSIA'] })

  const { data } = useGetBooks({
    ...filters,
    cityId: searchCity,
    search,
  })

  const toggleFilter = <T extends string>(current: T[] | undefined, value: T): T[] => {
    if (current?.includes(value)) {
      return current.filter((v) => v !== value)
    }

    return [...(current || []), value]
  }

  const togglePlace = (value: string) => {
    const needsPlace = value === PLACES.MY_PLACE.en || value === PLACES.NEAR.en

    if (needsPlace && !searchCity) {
      message.warning('Сначала выберите город в фильтрах')

      return
    }
    setFilters((prev) => ({
      ...prev,
      page: 0,
      place: toggleFilter(prev.place, value as any),
    }))
  }

  useEffect(() => {
    setFilters({ ...filters, page: 0 })
  }, [search])

  return (
    <Container>
      <div style={{ minHeight: '100%', width: '100%' }}>
        <Typography.Title style={{ fontSize: 40, lineHeight: 1.2, width: 156, marginBottom: 32 }}>
          Каталог
        </Typography.Title>
        <Flex>
          <Flex>
            <Card style={{ width: 285, height: 524, borderRadius: 20 }} styles={{ body: { padding: '32px 24px' } }}>
              <Flex vertical>
                <Flex vertical style={{ gap: '32px' }}>
                  <Flex vertical style={{ gap: '16px' }}>
                    <Typography.Title
                      level={3}
                      style={{ fontSize: 20, lineHeight: 1.2, fontWeight: 600, color: '#000F08' }}
                    >
                      Где искать
                    </Typography.Title>
                    {placeOptions.map(({ value, label }) => {
                      const needsPlace = value === PLACES.MY_PLACE.en || value === PLACES.NEAR.en
                      const isDisabled = needsPlace && !searchCity

                      return (
                        <Checkbox
                          key={value}
                          checked={filters.place?.includes(value)}
                          onChange={() => togglePlace(value)}
                          style={{ fontSize: 16, lineHeight: 1.2 }}
                          disabled={isDisabled}
                        >
                          {label}
                        </Checkbox>
                      )
                    })}
                  </Flex>

                  <Flex vertical style={{ gap: '16px' }}>
                    <Typography.Title level={3} style={{ fontSize: 20, lineHeight: 1.2 }}>
                      Состояние книги
                    </Typography.Title>
                    {conditionOptions.map(({ value, label }) => (
                      <Checkbox
                        key={value}
                        checked={filters.condition?.includes(value)}
                        style={{ fontSize: 16, lineHeight: 1.2 }}
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
                  <Flex vertical style={{ gap: '16px' }}>
                    <Typography.Title level={3} style={{ fontSize: 20, lineHeight: 1.2 }}>
                      Тип обмена
                    </Typography.Title>
                    {exchangeTypeOptions.map(({ value, label }) => (
                      <Checkbox
                        key={value}
                        checked={filters.exchange?.includes(value)}
                        style={{ fontSize: 16, lineHeight: 1.2 }}
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
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          </Flex>
          <Row gutter={[20, 40]} style={{ width: '100%', marginLeft: 10 }}>
            {data?.items.map((item) => (
              <Col key={item.id} style={{ maxWidth: 305 }}>
                <BookCard item={item} />
              </Col>
            ))}
            <Col span={24}>
              <Pagination
                showSizeChanger={false}
                current={(data?.page ?? 0) + 1}
                total={(data?.totalPages || 1) * 12}
                pageSize={12}
                onChange={(page) => setFilters({ ...filters, page: page - 1 })}
              />
            </Col>
          </Row>
        </Flex>
      </div>
    </Container>
  )
}
