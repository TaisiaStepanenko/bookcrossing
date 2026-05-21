import { useState } from 'react'

import { Button, Flex, message, Modal, Rate, Typography } from 'antd'

import { useAddReview } from '../../api/hooks'
import type { Review } from '../../api/models'
import StarIcon from '../../assets/star.svg'
import { TextField } from '../ui/Input'

export const ReviewModal = ({
  setOpen,
  setReview,
  transferId,
}: {
  setOpen: (open: boolean) => void
  setReview: () => void
  transferId: number
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { mutate } = useAddReview()

  const [data, setData] = useState<Omit<Review, 'transferId'>>({
    rating: 0,
    comment: '',
  })

  const handleReview = async () => {
    mutate(
      {
        transferId: Number(transferId),
        rating: data.rating,
        comment: data.comment,
      },
      {
        onSuccess: () => {
          message.success('Отзыв отправлен!')
          setOpen(false)
        },
        onError: (error: any) => {
          message.error(error?.response?.data?.message || 'Ошибка при отправке отзыва')
        },
      },
    )
  }

  const onChange = (name: any, value: any) => setData({ ...data, [name]: value })

  const getIsDisabled = () => data.rating === 0

  return (
    <Modal open onCancel={() => setOpen(false)} footer={null}>
      <Flex vertical gap="middle">
        <Typography.Title level={3} style={{ textAlign: 'center', display: 'block' }}>
          Отзыв об обмене
        </Typography.Title>
        <Typography.Title style={{ margin: 0 }} level={4}>
          Оцените второго участника обмена
        </Typography.Title>
        <Flex gap="small" align="center">
          <Rate
            value={data.rating}
            onChange={(value) => onChange('rating', value)}
            character={
              <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14.5013 26.5833L12.0702 20.2624C11.7294 19.3764 11.559 18.9334 11.2941 18.5608C11.0593 18.2305 10.7707 17.942 10.4405 17.7072C10.0678 17.4422 9.62485 17.2718 8.73886 16.9311L2.41797 14.5L8.73886 12.0688C9.62485 11.7281 10.0678 11.5577 10.4405 11.2927C10.7707 11.0579 11.0593 10.7694 11.2941 10.4391C11.559 10.0665 11.7294 9.62351 12.0702 8.73752L14.5013 2.41663L16.9324 8.73752C17.2732 9.62351 17.4436 10.0665 17.7085 10.4391C17.9433 10.7694 18.2319 11.0579 18.5621 11.2927C18.9348 11.5577 19.3778 11.7281 20.2637 12.0688L26.5846 14.5L20.2637 16.9311C19.3778 17.2718 18.9348 17.4422 18.5621 17.7072C18.2319 17.942 17.9433 18.2305 17.7085 18.5608C17.4436 18.9334 17.2732 19.3764 16.9324 20.2624L14.5013 26.5833Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <Typography.Text style={{ fontSize: 20 }}>({data.rating})</Typography.Text>
        </Flex>
        <Typography.Title style={{ margin: 0 }} level={4}>
          Поделитесь впечатлением
        </Typography.Title>
        <TextField
          onChange={(e) => onChange('comment', e.target.value)}
          value={data.comment || ''}
          placeholder="Опишите, как прошёл обмен"
          rows={3}
        />
        <Flex gap="small">
          <Button color="green" variant="solid" disabled={getIsDisabled()} onClick={handleReview}>
            Оставить отзыв
          </Button>
          <Button onClick={() => setOpen(false)} color="default" variant="outlined">
            Отмена
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}
