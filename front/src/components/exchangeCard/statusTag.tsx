import { Tag } from 'antd'

import type { TransferStatus } from '../../api/models'

export const StatusTag = ({ status }: { status: TransferStatus }) => {
  const COLOR: Partial<Record<TransferStatus, { text: string; color: string }>> = {
    WAITING_TO_BE_SENT: {
      text: 'Ждет отправки',
      color: '#648DE5',
    },
    SENT: {
      text: 'Отправлен',
      color: '#F17300',
    },
    RECEIVED: {
      text: 'Получен',
      color: '#F26CA7',
    },
  }

  const color = COLOR[status]

  if (!color) return null

  return (
    <Tag color={COLOR[status]?.color} variant="outlined">
      {COLOR[status]?.text}
    </Tag>
  )
}
