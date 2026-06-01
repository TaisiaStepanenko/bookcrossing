import type { CSSProperties } from 'react'

import { GiftOutlined, TruckOutlined } from '@ant-design/icons'

import { Divider, Flex, Tag } from 'antd'

import type { ExchangeMethod, ExchangeType } from '../../api/models'

const STATUS = {
  DELIVERY: { color: '#648DE5', text: 'Только доставка', icon: <TruckOutlined /> },
  MEETING: { color: '#648DE5', text: 'Личная встреча', icon: <TruckOutlined /> },
  ALL: { color: '#648DE5', text: 'Личная встреча и Доставка', icon: <TruckOutlined /> },
}

const FREE_STATUS = { color: '#A30B37', text: 'Отдам даром', icon: <GiftOutlined /> }

export const BookStatus = ({
  exchangeType,
  exchangeMethod,
  style,
}: {
  exchangeType: ExchangeType
  exchangeMethod: ExchangeMethod
  style?: CSSProperties
}) => {
  if (exchangeType === 'FREE') {
    const { color, icon, text } = FREE_STATUS

    return (
      <Flex gap="small" align="center" wrap>
        <Tag color={color} icon={icon} variant="solid" style={style}>
          {text}
        </Tag>
      </Flex>
    )
  }

  const { color, icon, text } = STATUS[exchangeMethod]

  return (
    <>
      <Flex gap="small" align="center" wrap>
        <Tag color={color} icon={icon} variant="solid" style={style}>
          {text}
        </Tag>
      </Flex>
    </>
  )
}
