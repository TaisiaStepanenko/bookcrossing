import { useState } from 'react'

import { Breadcrumb, Button, Flex } from 'antd'

import { useGetExchange, useGetIncomingExchanges } from '../../api/hooks'
import { ExchangeBaseCard } from '../exchangeBaseCard'
import { ExchangeCard } from '../exchangeCard'

import styles from './styles.module.scss'

export const BooksExchanges = ({ type }: { type?: 'running' | 'ended' }) => {
  const [selected, setSelected] = useState('income')
  const [request, setExchange] = useState({ id: '', name: '' })

  const changeSelected = (newSelected: string) => {
    setSelected(newSelected)
    setExchange({ id: '', name: '' })
  }

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      {!type && (
        <Flex gap="small">
          <Button
            onClick={() => changeSelected('income')}
            color="default"
            variant="outlined"
            style={{ fontSize: 16, padding: '11px 16px', height: 'auto', lineHeight: 1.2 }}
            className={selected === 'income' ? styles['selected-btn'] : styles['not-selected-btn']}
          >
            Входящие заявки
          </Button>
          <Button
            onClick={() => changeSelected('outgoing')}
            color="default"
            variant="outlined"
            style={{ fontSize: 16, padding: '11px 16px', height: 'auto', lineHeight: 1.2 }}
            className={selected === 'outgoing' ? styles['selected-btn'] : styles['not-selected-btn']}
          >
            Исходящие заявки
          </Button>
        </Flex>
      )}
      <Flex vertical style={{ maxHeight: '1000px', overflow: 'auto' }} gap={20}>
        {selected === 'income' && !type ? (
          <Incomming id={request.id} setExchange={setExchange} name={request.name} selected={selected} />
        ) : (
          <ExhangesList type={type || 'outcoming'} />
        )}
      </Flex>
    </Flex>
  )
}

const Incomming = ({
  id,
  setExchange,
  name,
  selected,
}: {
  id: string
  selected: string
  name: string
  setExchange: React.Dispatch<
    React.SetStateAction<{
      id: string
      name: string
    }>
  >
}) => {
  const { data } = useGetIncomingExchanges()
  const incomingExchange = useGetExchange('incoming', id, !!id)

  return (
    <>
      {id && (
        <Breadcrumb
          separator=">"
          items={[
            { title: 'Заявки на обмен' },
            {
              title: selected === 'income' ? 'Входящие заявки' : 'Исходящие заявки',
              onClick: () => setExchange({ id: '', name: '' }),
              style: { cursor: 'pointer' },
            },
            { title: name },
          ]}
        />
      )}
      {!id
        ? data?.map((data) => <ExchangeBaseCard data={data} key={data.id} setExchange={setExchange} />)
        : incomingExchange.data?.map((data) => <ExchangeCard data={data} type="incoming" key={data.id} />)}
    </>
  )
}

const ExhangesList = ({ type }: { type: 'outcoming' | 'running' | 'ended' }) => {
  const exchanges = useGetExchange(type)

  console.log(type)

  return exchanges.data?.map((data) => <ExchangeCard key={data.id} data={data} type={type} />)
}
