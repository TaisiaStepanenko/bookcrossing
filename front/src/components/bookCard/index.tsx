import { useNavigate } from 'react-router-dom'

import { EnvironmentOutlined, HeartOutlined } from '@ant-design/icons'

import { Button, Flex, Typography } from 'antd'

import { useAddFavorite, useRemoveFavorite } from '../../api/hooks'
import { type BookCatalogItem } from '../../api/models'
import BookImg from '../../assets/placeholder-book.png'
import { BookStatus } from '../bookStatus'

export const BookCard = ({ item }: { item: BookCatalogItem }) => {
  const navigate = useNavigate()
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (item.isFavorite) {
      removeFavorite.mutateAsync(item.id)
    } else {
      addFavorite.mutateAsync(item.id)
    }
  }

  const imageUrl = item.src ? `${process.env.VITE_API_URL}${item.src}` : BookImg

  return (
    <Flex vertical style={{ position: 'relative' }} onClick={() => navigate(`/book/${item.id}`)}>
      {!item.isMyBook && (
        <Button
          type="primary"
          size="small"
          shape="circle"
          icon={<HeartOutlined />}
          style={{
            position: 'absolute',
            top: 11,
            right: 12,
            height: 29,
            width: 29,
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: item.isFavorite ? '#A30B37' : 'inherit',
            border: 'none',
            boxShadow: 'unset',
          }}
          onClick={handleFavorite}
        />
      )}
      <img
        width={285}
        height={359}
        alt="basic"
        src={imageUrl}
        style={{
          borderRadius: 20,
          objectFit: 'cover',
          marginBottom: 16,
          backgroundColor: '#f5f5f5',
        }}
        onError={(e) => {
          e.currentTarget.src = BookImg
        }}
      />
      <BookStatus
        exchangeType={item.exchangeType}
        exchangeMethod={item.exchangeMethod}
        style={{ position: 'absolute', top: 12, left: 12 }}
      />
      <Typography.Title level={3} style={{ maxWidth: '285px', marginBottom: 6, lineHeight: 1 }}>
        {item.name}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ maxWidth: '285px', marginBottom: 12, fontSize: 16, lineHeight: 1 }}>
        {item.author}
      </Typography.Text>
      <Typography.Text type="secondary" style={{ maxWidth: '285px', fontSize: 16, color: '#000F08', lineHeight: 1 }}>
        <EnvironmentOutlined /> {item.place}
      </Typography.Text>
    </Flex>
  )
}
