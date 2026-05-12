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
        <Typography.Title>Каталог</Typography.Title>
        <Flex>
          <Flex style={{ width: 285, height: 595 }}>
            <Card>
              <Flex vertical>
                <Flex vertical>
                  <Typography.Title level={3}>Где искать</Typography.Title>
                  {placeOptions.map(({ value, label }) => {
                    const needsPlace = value === PLACES.MY_PLACE.en || value === PLACES.NEAR.en
                    const isDisabled = needsPlace && !searchCity

                    return (
                      <Checkbox
                        key={value}
                        checked={filters.place?.includes(value)}
                        onChange={() => togglePlace(value)}
                        disabled={isDisabled}
                      >
                        {label}
                      </Checkbox>
                    )
                  })}

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
