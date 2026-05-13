import { useState } from 'react'

import { Avatar, Button, Card, Flex, Image, message, Modal, Tag, Typography } from 'antd'

import { useChangeStatus } from '../../api/hooks'
import type { IncomingExchange, TransferStatus } from '../../api/models'
import Arrows from '../../assets/arrows.png'
import { OFFER_COUNT } from '../exhange'
import { CancelModal } from './cancelModal'
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
  const [selected, setSelected] = useState<number[]>([])
  const [open, setOpen] = useState(false)

  const isFree = data.initiatorBooks.length === 0

  const onChangeSelected = (id: number) => {
    if (OFFER_COUNT[data.bookCount] < selected.length) {
      return null
    } else {
      if (!selected.includes(id)) {
        setSelected([...selected, id])
      } else {
        setSelected(selected.filter((v) => v !== id))
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
    if (data.type === 'COMPLETED_SUCCESS') {
      return `Успешно завершён ${new Date(data.endedDate || '').toLocaleDateString()}`
    } else if (data.type === 'COMPLETED_PREMATURELY') {
      return `Досрочно завершён ${new Date(data.endedDate || '').toLocaleDateString()}`
    } else if (data.type === 'CANCELLED') {
      return 'Отменен'
    } else {
      return ''
    }
  }

  const getIsDisabledAccept = () =>
    (data.type === 'WAITING_RESPONSE' && OFFER_COUNT[data.bookCount] !== selected.length) ||
    (type === 'incoming' && data.type === 'WAITING_CONFIRMATION') ||
    (type === 'outcoming' && data.type === 'WAITING_RESPONSE')

  const showRunningButton = () => {
    const { currentStatusInitiator, currentStatusOwner, userType, type } = data

    if (type !== 'WAITING_TO_BE_SENT' && type !== 'SENT' && type !== 'RECEIVED') return false

    if (userType === 'INITIATOR') {
      return ['WAITING_TO_BE_SENT', 'SENT', 'RECEIVED'].includes(currentStatusInitiator)
    }
    if (userType === 'OWNER') {
      return ['WAITING_TO_BE_SENT', 'RECEIVED'].includes(currentStatusOwner)
    }

    return false
  }

  const runningButtonText = () => {
    const { currentStatusInitiator, currentStatusOwner, userType } = data

    if (userType === 'INITIATOR') {
      if (currentStatusInitiator === 'WAITING_TO_BE_SENT') return 'Отправить'
      if (currentStatusInitiator === 'SENT') return 'Подтвердить получение'
      if (currentStatusInitiator === 'RECEIVED') return 'Завершено'
    }

    if (userType === 'OWNER') {
      if (currentStatusOwner === 'WAITING_TO_BE_SENT') return 'Отправить'
      if (currentStatusOwner === 'SENT') return 'Подтвердить получение'
      if (currentStatusOwner === 'RECEIVED') return 'Завершено'
    }

    return ''
  }

  const cancel = () =>
    mutate(
      { activity: 'cancel' },
      {
        onSuccess: () => {
          setOpen(false)
        },
      },
    )

  console.log(data)

  return (
    <Card style={{ width: '100%' }}>
      <Flex vertical gap="middle">
        <Flex gap="small">
          <Avatar src={`${import.meta.env.VITE_API_URL}${data.avatar}`} />
          <Flex vertical>
            <Typography.Title style={{ margin: 0 }} level={4}>
              {getTitle()}
            </Typography.Title>
            {getEndedText() ? (
              <Typography.Text disabled>{getEndedText()}</Typography.Text>
            ) : (
              isFree && (
                <Typography.Text>
                  {data.bookCount === 'THREE'
                    ? 'Все 3 книги на 1 вашу'
                    : data.bookCount === 'TWO'
                      ? '2 из 3 книг на выбор'
                      : '1 из 3 книг на выбор'}
                </Typography.Text>
              )
            )}
          </Flex>
        </Flex>
        <Flex gap="small" align="center">
          <Image src={`${import.meta.env.VITE_API_URL}${data.ownerBook.src}`} height={240} width={178} />
          {!isFree && <Image src={Arrows} height={80} width={69} />}
          {!isFree &&
            data.initiatorBooks.map((book) => (
              <Image
                onClick={() => type === 'incoming' && data.type === 'WAITING_RESPONSE' && onChangeSelected(book.id)}
                src={`${import.meta.env.VITE_API_URL}${book.src}`}
                className={selected.includes(book.id) ? styles.selected : undefined}
                preview={false}
                key={book.id}
                height={240}
                width={178}
              />
            ))}
        </Flex>
        <Flex gap="middle">
          <Flex vertical>
            <Typography.Title style={{ margin: 0 }} level={4}>
              {data.userType === 'OWNER' ? 'Вы отдаете' : 'Вы получаете'}
            </Typography.Title>
            <Typography.Text>{data.ownerBook.name}</Typography.Text>
          </Flex>
          {!isFree && (
            <Flex vertical>
              <Typography.Title style={{ margin: 0 }} level={4}>
                {data.userType === 'INITIATOR' ? 'Вы отдаете' : 'Вы получаете'}
              </Typography.Title>
              {data.initiatorBooks.map((book, index) => (
                <Typography.Text key={book.id}>
                  {index + 1}. {book.name}
                </Typography.Text>
              ))}
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
            <Flex vertical gap="small">
              <Typography.Title style={{ margin: 0 }} level={4}>
                Текущий статус
              </Typography.Title>
              <StatusTag status={data.currentStatusInitiator} />
            </Flex>
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
            <Button color="orange" variant="outlined" style={{ width: 156 }} onClick={() => setOpen(true)}>
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
            {isFree && (
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
            <Button color="orange" variant="outlined" onClick={() => cancel()}>
              Отменить заявку
            </Button>
          </Flex>
        )}
      </Flex>
      {open && <CancelModal setOpen={setOpen} cancel={cancel} />}
    </Card>
  )
}
