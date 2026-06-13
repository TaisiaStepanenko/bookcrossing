import { useState } from 'react'

import { Avatar, Button, Card, Flex, Image, message, Modal, Tag, Typography } from 'antd'

import { useAddReview, useChangeStatus } from '../../api/hooks'
import type { IncomingExchange, TransferStatus } from '../../api/models'
import Arrows from '../../assets/arrows.png'
import { OFFER_COUNT } from '../exhange'
import { CancelModal } from './cancelModal'
import { ReviewModal } from './reviewModal'
import { StatusTag } from './statusTag'

import styles from './styles.module.scss'

export const ExchangeCard = ({
  data,
  type,
}: {
  data: IncomingExchange
  type: 'incoming' | 'outcoming' | 'running' | 'ended'
}) => {
  const { mutate } = useChangeStatus(data.id)
  const { mutate: mutateReview } = useAddReview()
  const [selected, setSelected] = useState<number[]>([])
  const [openCancelModal, setOpenCancelModal] = useState(false)
  const [openReviewModal, setOpenReviewModal] = useState(false)

  const isFree = data.initiatorBooks.length === 0

  const onChangeSelected = (id: number) => {
    const maxAllowed = OFFER_COUNT[data.bookCount]
    const isSelected = selected.includes(id)

    if (isSelected) {
      setSelected((prev) => prev.filter((v) => v !== id))
    } else {
      if (selected.length < maxAllowed) {
        setSelected((prev) => [...prev, id])
      } else {
        message.warning(`Можно выбрать не более ${maxAllowed} книг`)
      }
    }
  }

  const getTitle = () => {
    if (type === 'incoming') {
      return isFree ? `${data.name} хочет получить вашу книгу` : `${data.name} предлагает обмен`
    }
    if (type === 'outcoming') {
      return isFree ? `Вы запросили книгу у ${data.name}` : `Ваше предложение обмена для ${data.name}`
    }
  }

  const getHelperText = () => {
    if (type === 'incoming') {
      if (data.type === 'WAITING_RESPONSE') {
        return ''
      } else if (data.type === 'WAITING_CONFIRMATION') {
        return 'Вы приняли предложение обмена. Дождитесь ответа от запрашивающего'
      }
    }
    if (type === 'outcoming') {
      if (data.type === 'WAITING_RESPONSE') {
        return `${data.name} пока не принял ваше предложение`
      } else if (data.type === 'WAITING_CONFIRMATION') {
        return `${data.name} принял ваше предложение`
      }
    }

    return ''
  }

  const getEndedText = () => {
    const status = data.type?.toUpperCase()

    if (status === 'COMPLETED_SUCCESS' || status === 'COMPLETED' || status === 'ENDED') {
      if (data.endedDate && !isNaN(new Date(data.endedDate).getTime())) {
        return `Успешно завершён ${new Date(data.endedDate).toLocaleDateString()}`
      }

      return 'Успешно завершён'
    }
    if (status === 'COMPLETED_PREMATURELY') {
      if (data.endedDate && !isNaN(new Date(data.endedDate).getTime())) {
        return `Досрочно завершён ${new Date(data.endedDate).toLocaleDateString()}`
      }

      return 'Досрочно завершён'
    }
    if (status === 'CANCELLED') return 'Отменен'

    return ''
  }

  const getIsDisabledAccept = () =>
    (data.type === 'WAITING_RESPONSE' && OFFER_COUNT[data.bookCount] !== selected.length) ||
    (type === 'incoming' && data.type === 'WAITING_CONFIRMATION') ||
    (type === 'outcoming' && data.type === 'WAITING_RESPONSE')

  const showRunningButton = () => {
    const { currentStatusInitiator, currentStatusOwner, userType, type } = data

    if (type !== 'WAITING_TO_BE_SENT' && type !== 'SENT' && type !== 'RECEIVED') return false

    if (isFree) {
      if (userType === 'OWNER') {
        return currentStatusOwner === 'WAITING_TO_BE_SENT'
      }
      if (userType === 'INITIATOR') {
        return currentStatusInitiator === 'SENT'
      }

      return false
    } else {
      // Обмен
      if (userType === 'INITIATOR') {
        return ['WAITING_TO_BE_SENT', 'SENT', 'RECEIVED'].includes(currentStatusInitiator)
      }
      if (userType === 'OWNER') {
        return ['WAITING_TO_BE_SENT', 'SENT', 'RECEIVED'].includes(currentStatusOwner)
      }

      return false
    }
  }

  const runningButtonText = () => {
    const { currentStatusInitiator, currentStatusOwner, userType } = data

    if (isFree) {
      if (userType === 'OWNER' && currentStatusOwner === 'WAITING_TO_BE_SENT') return 'Отправить'
      if (userType === 'INITIATOR' && currentStatusInitiator === 'SENT') return 'Подтвердить получение'

      return ''
    } else {
      if (userType === 'INITIATOR') {
        if (currentStatusInitiator === 'WAITING_TO_BE_SENT') return 'Отправить'
        if (currentStatusInitiator === 'SENT') return 'Подтвердить получение'
        if (currentStatusInitiator === 'RECEIVED') return 'Завершить обмен'
      }
      if (userType === 'OWNER') {
        if (currentStatusOwner === 'WAITING_TO_BE_SENT') return 'Отправить'
        if (currentStatusOwner === 'SENT') return 'Подтвердить получение'
        if (currentStatusOwner === 'RECEIVED') return 'Завершить обмен'
      }

      return ''
    }
  }

  const cancel = () =>
    mutate(
      { activity: 'cancel' },
      {
        onSuccess: () => {
          setOpenCancelModal(false)
        },
      },
    )

  const setReview = () =>
    mutateReview({} as any, {
      onSuccess: () => {
        setOpenCancelModal(false)
      },
    })

  return (
    <Card style={{ width: '100%', borderRadius: 20 }} styles={{ body: { padding: '20px 20px' } }}>
      <Flex vertical gap={32}>
        <Flex gap="middle" align="center">
          <Avatar
            size={64}
            style={{ backgroundColor: '#f56a00', fontSize: 28 }}
            src={`${process.env.VITE_API_URL}${data.avatar}`}
          >
            {data.name[0]}
          </Avatar>
          <Flex vertical gap={4}>
            <Typography.Title style={{ margin: 0 }} level={2}>
              {getTitle()}
            </Typography.Title>
            {getEndedText() ? (
              <Typography.Text style={{ color: '#7D8B9B' }}>{getEndedText()}</Typography.Text>
            ) : isFree ? (
              <Typography.Text style={{ color: '#7D8B9B' }}>Книга отдаётся даром</Typography.Text>
            ) : (
              <Typography.Text style={{ color: '#7D8B9B' }}>
                {data.bookCount === 'THREE'
                  ? 'Все 3 книги на 1 вашу'
                  : data.bookCount === 'TWO'
                    ? '2 из 3 книг на выбор'
                    : '1 из 3 книг на выбор'}
              </Typography.Text>
            )}
          </Flex>
        </Flex>
        <Flex gap={32} align="center">
          <Image
            src={`${process.env.VITE_API_URL}${data.ownerBook.src}`}
            height={240}
            width={178}
            style={{ objectFit: 'cover' }}
          />
          {!isFree && <Image src={Arrows} height={80} width={69} style={{ borderRadius: 0 }} />}
          <Flex gap={8}>
            {!isFree &&
              data.initiatorBooks.map((book) => (
                <Image
                  onClick={() => type === 'incoming' && data.type === 'WAITING_RESPONSE' && onChangeSelected(book.id)}
                  src={`${process.env.VITE_API_URL}${book.src}`}
                  className={selected.includes(book.id) ? styles.selected : undefined}
                  preview={false}
                  key={book.id}
                  height={240}
                  width={178}
                  style={{ objectFit: 'cover' }}
                />
              ))}
          </Flex>
        </Flex>
        <Flex gap={32}>
          <Flex vertical gap="small">
            <Typography.Title style={{ margin: 0 }} level={3}>
              {data.userType === 'OWNER' ? 'Вы отдаете' : 'Вы получаете'}
            </Typography.Title>
            <Typography.Text>{data.ownerBook.name}</Typography.Text>
          </Flex>
          {!isFree && (
            <Flex vertical gap="small">
              <Typography.Title style={{ margin: 0 }} level={3}>
                {data.userType === 'INITIATOR' ? 'Вы отдаете' : 'Вы получаете'}
              </Typography.Title>
              <Flex vertical gap={2}>
                {data.initiatorBooks.map((book, index) => (
                  <Typography.Text key={book.id}>
                    {index + 1}. {book.name}
                  </Typography.Text>
                ))}
              </Flex>
            </Flex>
          )}
        </Flex>
        {type === 'running' && (
          <Flex gap="middle">
            <Flex vertical gap="small">
              <Typography.Title style={{ margin: 0 }} level={4}>
                Текущий статус
              </Typography.Title>
              <StatusTag status={data.currentStatusOwner} />
            </Flex>
            {!isFree && (
              <Flex vertical gap="small">
                <Typography.Title style={{ margin: 0 }} level={4}>
                  Текущий статус
                </Typography.Title>
                <StatusTag status={data.currentStatusInitiator} />
              </Flex>
            )}
          </Flex>
        )}
        {type === 'running' && (
          <Flex vertical gap="middle">
            {showRunningButton() && (
              <Button
                color="default"
                disabled={getIsDisabledAccept()}
                variant="solid"
                style={{ width: 156 }}
                onClick={() => mutate({ activity: 'accept' })}
              >
                {runningButtonText()}
              </Button>
            )}
            <Button color="orange" variant="outlined" style={{ width: 156 }} onClick={() => setOpenCancelModal(true)}>
              Завершить обмен
            </Button>
            <Typography.Text disabled>
              В случае возникновения проблем с данным обменом нажмитена эту кнопку
            </Typography.Text>
          </Flex>
        )}

        <Typography.Text strong>{getHelperText()}</Typography.Text>
        {/* Входящие заявки – владелец книги */}
        {type === 'incoming' && (
          <Flex gap="small">
            {!isFree && (
              <Button
                color="default"
                disabled={getIsDisabledAccept()}
                variant="solid"
                onClick={() => mutate({ activity: 'accept', keptBookIds: selected })}
              >
                Обменяться
              </Button>
            )}
            {isFree && data.type === 'WAITING_RESPONSE' && (
              <Button color="default" variant="solid" onClick={() => mutate({ activity: 'accept' })}>
                Принять заявку
              </Button>
            )}
            <Button color="orange" variant="outlined" onClick={() => cancel()}>
              Отклонить
            </Button>
          </Flex>
        )}

        {/* Исходящие заявки – инициатор (только отмена) */}
        {type === 'outcoming' && (
          <Flex gap="small">
            <Button
              color="default"
              disabled={getIsDisabledAccept()}
              variant="solid"
              style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
              onClick={() => mutate({ activity: 'accept', keptBookIds: selected })}
            >
              Обменяться
            </Button>
            <Button
              color="orange"
              variant="outlined"
              style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
              onClick={() => cancel()}
            >
              Отменить заявку
            </Button>
          </Flex>
        )}

        {type === 'ended' &&
          !data.hasReview &&
          (data.type === 'COMPLETED_SUCCESS' || data.type === 'COMPLETED_PREMATURELY') && (
            <Flex>
              <Button color="default" variant="solid" onClick={() => setOpenReviewModal(true)}>
                Оставить отзыв
              </Button>
            </Flex>
          )}
      </Flex>
      {openCancelModal && <CancelModal setOpen={setOpenCancelModal} cancel={cancel} />}
      {openReviewModal && <ReviewModal setOpen={setOpenReviewModal} setReview={setReview} transferId={data.id} />}
    </Card>
  )
}
