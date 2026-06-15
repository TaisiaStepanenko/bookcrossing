import { useState } from 'react'

import { CloseOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'

import { Avatar, Button, Card, Col, Flex, Image, message, Modal, Pagination, Row, Typography } from 'antd'

import { useAddExchange, useGetBooks } from '../../api/hooks'
import { type ExchangeType, OFFER_TYPE, type OfferType } from '../../api/models'
import AddBookExchange from '../../assets/addBookExchange.png'
import Arrows from '../../assets/arrows.png'
import BookImg from '../../assets/placeholder-book.png'
import { CustomSelect } from '../ui/Select'

export const ExchangeWithModal = ({
  open,
  setOpen,
  book,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  book: Selected
}) => {
  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={893}
      modalRender={(node) => <div style={{ width: 910 }}>{node}</div>}
    >
      <NewExchange book={book} close={() => setOpen(false)} />
    </Modal>
  )
}

interface Selected {
  url: string
  name: string
  id: number
  exchangeType?: ExchangeType
}

export const OFFER_COUNT: Record<OfferType, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
}

export const NewExchange = ({ book, close }: { book: Selected; close: () => void }) => {
  const [offerType, setOfferType] = useState<OfferType>('ONE')
  const [selected, setSelected] = useState<Selected[]>([])
  const [getBookOpened, setGetBookOpened] = useState(false)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()
  const { mutate } = useAddExchange()

  const isFree = book.exchangeType === 'FREE'

  const removeBook = (id: number) => {
    setSelected((prev) => prev.filter((b) => b.id !== id))
  }
  const imageUrl = book.url ? `${process.env.VITE_API_URL}${book.url}` : BookImg

  const getErrorMessage = (error: any): string => {
    const msg = error?.response?.data?.message

    if (msg === 'You already have an active exchange request for this book') {
      return 'У вас уже есть активная заявка на эту книгу'
    }

    return msg || 'Ошибка при отправке обмена'
  }
  const handleExchange = () => {
    if (!offerType) {
      setError('Сначала выберете книги для обмена и тип обмена')

      return
    }

    setError('')
    mutate(
      {
        offeredBookIds: selected.map((item) => item.id),
        offerType: isFree ? undefined : offerType,
        targetBookId: book.id,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['books', { myBook: true }] })
          queryClient.invalidateQueries({ queryKey: ['books', { favorite: true }] })
          message.success('Обмен отправлен!')
          close()
        },
        onError: (error: any) => {
          message.error(getErrorMessage(error))
        },
      },
    )
  }

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      <Typography.Title style={{ margin: 0, textAlign: 'center' }} level={2}>
        Заявка на {isFree ? 'получение книги' : 'обмен'}
      </Typography.Title>

      {!isFree && (
        <Typography.Title style={{ margin: 0 }} level={3}>
          Ваберете книги для обмена
        </Typography.Title>
      )}

      {/* КНИГИ */}
      <Flex gap={32} align="center">
        <Image src={imageUrl} height={240} width={178} style={{ objectFit: 'cover' }} />

        {!isFree && (
          <>
            <Image src={Arrows} height={80} width={69} style={{ borderRadius: 0 }} />
            <Flex gap="small">
              {[0, 1, 2].map((i) => {
                const item = selected[i]

                return (
                  <div key={i} style={{ position: 'relative' }}>
                    <Image
                      onClick={() => setGetBookOpened(true)}
                      src={item ? item.url : AddBookExchange}
                      preview={false}
                      height={240}
                      width={178}
                      style={{ objectFit: 'cover' }}
                    />

                    {/* КНОПКА УДАЛЕНИЯ */}
                    {item && (
                      <Button
                        shape="circle"
                        icon={<CloseOutlined />}
                        size="small"
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => removeBook(item.id)}
                      />
                    )}
                  </div>
                )
              })}
            </Flex>
          </>
        )}
      </Flex>

      {/* ОПИСАНИЕ */}
      <Flex gap={32}>
        <Flex vertical gap="small" style={{ width: 244 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Вы получаете
          </Typography.Title>
          <Typography.Text>{book.name}</Typography.Text>
        </Flex>

        {!isFree && (
          <Flex vertical gap="small">
            <Typography.Title level={3} style={{ margin: 0 }}>
              Вы предлагаете к обмену
            </Typography.Title>

            <Flex vertical gap={2}>
              {selected.length ? (
                selected.map(({ name }, index) => (
                  <Typography.Text key={index}>
                    {index + 1}. {name}
                  </Typography.Text>
                ))
              ) : (
                <Typography.Text>-</Typography.Text>
              )}
            </Flex>
          </Flex>
        )}
      </Flex>

      {/* SELECT */}
      {!isFree && (
        <Flex vertical gap="small">
          <Typography.Title level={3}>Выберете тип обмена</Typography.Title>
          <CustomSelect
            onChange={(v) => {
              setOfferType(v)
            }}
            value={offerType}
            required
            placeholder="Выберете способ обмена"
            style={{ width: '100%' }}
            options={Object.keys(OFFER_TYPE).map((val) => ({
              value: val,
              label: OFFER_TYPE[val as keyof typeof OFFER_TYPE],
            }))}
          />
        </Flex>
      )}

      {/* КНОПКИ */}
      <Flex gap="small">
        <Button
          color="default"
          variant="solid"
          style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
          onClick={handleExchange}
        >
          Обменяться
        </Button>

        <Button style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }} onClick={close}>
          Отмена
        </Button>
      </Flex>

      {/* ОШИБКА */}
      {error && <Typography.Text type="danger">{error}</Typography.Text>}
      {getBookOpened && (
        <GetBook setGetBookOpened={setGetBookOpened} setSelected={setSelected} selected={selected} maxCount={3} />
      )}
    </Flex>
  )
}

const GetBook = ({
  setGetBookOpened,
  setSelected,
  selected,
  maxCount,
}: {
  setGetBookOpened: (open: boolean) => void
  setSelected: React.Dispatch<React.SetStateAction<Selected[]>>
  selected: Selected[]
  maxCount: number
}) => {
  const [page, setPage] = useState(0)
  const { data } = useGetBooks({ page, myBook: true })

  const onSelect = (book: Selected) => {
    if (selected.length >= maxCount) {
      message.warning(`Можно выбрать только ${maxCount} книг`)

      return
    }

    setSelected((prev) => {
      if (prev.find((b) => b.id === book.id)) return prev

      return [...prev, book]
    })

    setGetBookOpened(false)
  }

  return (
    <Modal open onCancel={() => setGetBookOpened(false)} footer={null} width={764}>
      <Row gutter={[20, 20]} style={{ width: '100%', marginLeft: 20 }}>
        {data?.items.map((item) => (
          <Col xs={8} key={item.id}>
            <Flex
              vertical
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() =>
                onSelect({
                  id: item.id,
                  name: item.name,
                  url: `${process.env.VITE_API_URL}${item.src}`,
                })
              }
            >
              <img
                height={240}
                width={178}
                alt="book"
                src={`${process.env.VITE_API_URL}${item.src}`}
                style={{ borderRadius: 16, objectFit: 'cover' }}
              />
              <Typography.Title level={3}>{item.name}</Typography.Title>
              <Typography.Text type="secondary">{item.author}</Typography.Text>
            </Flex>
          </Col>
        ))}

        <Col span={24}>
          <Pagination
            current={data?.page}
            total={(data?.totalPages || 1) * 12}
            pageSize={12}
            showSizeChanger={false}
            onChange={(page) => setPage(page)}
          />
        </Col>
      </Row>
    </Modal>
  )
}
