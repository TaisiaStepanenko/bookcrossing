import { useState } from 'react'

import { Breadcrumb, Button, Flex } from 'antd'

import { ExchangeBaseCard } from '../exchangeBaseCard'
import { ExchangeCard } from '../exchangeCard'

import styles from './styles.module.scss'

export const BooksExchanges = () => {
  const [selected, setSelected] = useState('income')
  const [request, setExchange] = useState({ id: '', name: '' })

  return (
    <Flex vertical gap="small" style={{ width: '100%' }}>
      {!request.id ? (
        <Flex gap="small">
          <Button
            onClick={() => setSelected('income')}
            color="default"
            variant="outlined"
            className={selected === 'income' ? styles['selected-btn'] : styles['not-selected-btn']}
          >
            Входящие заявки
          </Button>
          <Button
            onClick={() => setSelected('outgoing')}
            color="default"
            variant="outlined"
            className={selected === 'outgoing' ? styles['selected-btn'] : styles['not-selected-btn']}
          >
            Исходящие заявки
          </Button>
        </Flex>
      ) : (
        <Breadcrumb
          separator=">"
          items={[
            { title: 'Заявки на обмен' },
            {
              title: selected === 'income' ? 'Входящие заявки' : 'Исходящие заявки',
              onClick: () => setExchange({ id: '', name: '' }),
              style: { cursor: 'pointer' },
            },
            { title: request.name },
          ]}
        />
      )}
      <Flex vertical style={{ maxHeight: '1000px', overflow: 'auto' }} gap={'small'}>
        {!request.id ? (
          <>
            <ExchangeBaseCard setExchange={setExchange} />
            <ExchangeBaseCard setExchange={setExchange} />
            <ExchangeBaseCard setExchange={setExchange} />
            <ExchangeBaseCard setExchange={setExchange} />
            <ExchangeBaseCard setExchange={setExchange} />
            <ExchangeBaseCard setExchange={setExchange} />
            <ExchangeBaseCard setExchange={setExchange} />
            <ExchangeBaseCard setExchange={setExchange} />
            <ExchangeBaseCard setExchange={setExchange} />
            <ExchangeBaseCard setExchange={setExchange} />
          </>
        ) : (
          <>
            <ExchangeCard type="ALL" />
            <ExchangeCard type="ONE" />

            <ExchangeCard type="ALL" />
            <ExchangeCard type="ALL" />
            <ExchangeCard type="ALL" />
            <ExchangeCard type="ONE" />
            <ExchangeCard type="ONE" />

            <ExchangeCard type="ALL" />
            <ExchangeCard type="ONE" />
          </>
        )}
      </Flex>
    </Flex>
  )
}
