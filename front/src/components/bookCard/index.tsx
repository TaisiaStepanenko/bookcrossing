import { useNavigate } from 'react-router-dom'

import { EnvironmentOutlined, HeartOutlined } from '@ant-design/icons'

import { Badge, Button, Flex, Image, Tag, Typography } from 'antd'

import { useAddFavorite } from '../../api/hooks'
import { type BookCatalogItem, PLACES } from '../../api/models'
import testImg from '../../assets/testImg.png'
import { BookStatus } from '../bookStatus'

export const BookCard = ({ item }: { item: BookCatalogItem }) => {
  const navigate = useNavigate()
  const addFavorite = useAddFavorite()

  return (
    <Flex vertical style={{ position: 'relative' }} onClick={() => navigate(`/book/${item.id}`)}>
      <Button
        type="primary"
        size="small"
        shape="circle"
        icon={<HeartOutlined />}
        style={{
          position: 'absolute',
          top: 12,
          right: 24,
          background: item.isFavorite ? '#A30B37' : 'inherit',
          border: undefined,
          boxShadow: 'unset',
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          addFavorite.mutateAsync(item.id)
        }}
      />
      <img
        width={285}
        height={359}
        alt="basic"
        src={`${import.meta.env.VITE_API_URL}${item.src}`}
        style={{ borderRadius: 16 }}
      />
      <BookStatus style={{ position: 'absolute', top: 12, left: 12 }} status={item.exchangeMethod} />
      <Typography.Title level={5}>{item.name}</Typography.Title>
      <Typography.Text color="secondary">{item.author}</Typography.Text>
      <Typography.Text color="secondary">
        <EnvironmentOutlined /> {item.place}
      </Typography.Text>
    </Flex>
  )
}
