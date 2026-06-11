import type { CSSProperties } from 'react'

import { GiftOutlined, TruckOutlined } from '@ant-design/icons'

import { Divider, Flex, Tag } from 'antd'

import type { ExchangeMethod, ExchangeType } from '../../api/models'

const STATUS = {
  DELIVERY: { color: '#648DE5', text: 'Только доставка', icon: <TruckOutlined /> },
  MEETING: { color: '#F17300', text: 'Личная встреча', icon: <TruckOutlined /> },
  ALL: { color: '#F26CA7', text: 'Лично или почтой', icon: <TruckOutlined /> },
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
  const tagStyle: CSSProperties = {
    height: 27,
    fontSize: 16,
    padding: '4px 8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    ...style,
  }

  if (exchangeType === 'FREE') {
    const { color, icon, text } = FREE_STATUS

    return (
      <Flex gap="small" align="center" wrap>
        <Tag color={color} icon={icon} variant="solid" style={tagStyle}>
          {text}
        </Tag>
      </Flex>
    )
  }

  const { color, icon, text } = STATUS[exchangeMethod]

  return (
    <>
      <Flex gap="small" align="center" wrap>
        <Tag color={color} icon={icon} variant="solid" style={tagStyle}>
          {text}
        </Tag>
      </Flex>
    </>
  )
}
