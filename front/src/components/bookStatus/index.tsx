import type { CSSProperties } from 'react'

import { TruckOutlined } from '@ant-design/icons'

import { Divider, Flex, Tag } from 'antd'

import type { ExchangeMethod } from '../../api/models'

const STATUS = {
  DELIVERY: { color: '#648DE5', text: 'Только доставка', icon: <TruckOutlined /> },
  MEETING: { color: '#648DE5', text: 'Личная встреча', icon: <TruckOutlined /> },
  ALL: { color: '#648DE5', text: 'Личная встреча и Доставка', icon: <TruckOutlined /> },
}

export const BookStatus = ({ status, style }: { status: ExchangeMethod; style?: CSSProperties }) => {
  const { color, icon, text } = STATUS[status]

  if (style)
    return (
      <Tag color={color} icon={icon} variant="solid" style={style}>
        {text}
      </Tag>
    )

  return (
    <>
      <Flex gap="small" align="center" wrap>
        <Tag color={color} icon={icon} variant="solid">
          {text}
        </Tag>
      </Flex>
    </>
  )
}
