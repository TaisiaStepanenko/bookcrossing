import { useState } from 'react'

import { CloseOutlined } from '@ant-design/icons'

import { Avatar, Button, Card, Col, Flex, Image, message, Modal, Pagination, Row, Typography } from 'antd'

import { useAddExchange, useGetBooks } from '../../api/hooks'
import { OFFER_TYPE, type OfferType } from '../../api/models'
import AddBookExchange from '../../assets/addBookExchange.png'
import Arrows from '../../assets/arrows.png'
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
    <Modal open={open} onCancel={() => setOpen(false)} footer={null} width={863}>
      <NewExchange book={book} close={() => setOpen(false)} />
    </Modal>
  )
}

interface Selected {
  url: string
  name: string
  id: number
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

  const { mutate } = useAddExchange()

  const maxCount = OFFER_COUNT[offerType]

  const removeBook = (id: number) => {
    setSelected((prev) => prev.filter((b) => b.id !== id))
  }

  const handleExchange = () => {
    if (!offerType || selected.length !== maxCount) {
      setError('Сначала выберите книги для обмена и тип обмена')

      return
    }

    setError('')
    console.log('asdasdasd')
    mutate({
      offeredBookIds: selected.map((item) => item.id),
      offerType: offerType,
      targetBookId: book.id,
    })
    message.success('Обмен отправлен!')
    close()
  }

  return (
    <Card style={{ width: '100%', maxWidth: 863 }}>
      <Flex vertical gap="middle">
        <Typography.Title style={{ margin: 0, textAlign: 'center' }} level={3}>
          Заявка на обмен
        </Typography.Title>

        <Typography.Title style={{ margin: 0 }} level={4}>
          Ваберете книги для обмена
        </Typography.Title>

        {/* КНИГИ */}
        <Flex gap="small" align="center">
          <Image src={`${import.meta.env.VITE_API_URL}${book.url}`} height={240} width={178} />

          <Image src={Arrows} height={80} width={69} />

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

        {/* ОПИСАНИЕ */}
        <Flex gap="middle">
          <Flex vertical>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Вы получаете
            </Typography.Title>
            <Typography.Text>{book.name}</Typography.Text>
          </Flex>

          <Flex vertical>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Вы предлагаете к обмену
            </Typography.Title>

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

        {/* SELECT */}
        <CustomSelect
          onChange={(v) => {
            setOfferType(v)

            if (OFFER_COUNT[v] < selected.length) setSelected([]) // сбрасываем выбор при смене типа
          }}
          value={offerType}
          label="Способы обмена"
          required
          placeholder="Выберете способ обмена"
          style={{ width: '100%' }}
          options={Object.keys(OFFER_TYPE).map((val: any) => ({
            value: val,
            label: OFFER_TYPE[val],
          }))}
        />

        {/* КНОПКИ */}
        <Flex gap="small">
          <Button color="default" variant="solid" onClick={handleExchange}>
            Обменяться
          </Button>

          <Button onClick={close}>Отмена</Button>
        </Flex>

        {/* ОШИБКА */}
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Flex>

      {getBookOpened && (
        <GetBook
          setGetBookOpened={setGetBookOpened}
          setSelected={setSelected}
          selected={selected}
          maxCount={maxCount}
        />
      )}
    </Card>
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
                  url: `${import.meta.env.VITE_API_URL}${item.src}`,
                })
              }
            >
              <img
                height={240}
                width={178}
                alt="book"
                src={`${import.meta.env.VITE_API_URL}${item.src}`}
                style={{ borderRadius: 16 }}
              />
              <Typography.Title level={5}>{item.name}</Typography.Title>
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
