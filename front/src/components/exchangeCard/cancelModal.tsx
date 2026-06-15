import { useState } from 'react'

import { Button, Card, Flex, Modal, Typography } from 'antd'

export const CancelModal = ({ setOpen, cancel }: { setOpen: (open: boolean) => void; cancel: () => void }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    setIsLoading(true)
    await cancel()
    setIsLoading(false)
  }

  return (
    <Modal open onCancel={() => setOpen(false)} footer={null} width={804} style={{ borderRadius: 24 }}>
      <Flex vertical gap="middle">
        <Typography.Title level={2} style={{ textAlign: 'center' }}>
          Действительно ли вы хотите <br /> досрочно завершить обмен?
        </Typography.Title>

        <Card style={{ width: '100%', height: 'auto', borderRadius: 20 }}>
          <Flex vertical gap="small">
            <Typography.Text>Досрочное завершение обмена возможно в следующих случаях:</Typography.Text>
            <ul style={{ fontSize: 16, padding: '0px 20px', margin: 0 }}>
              <li>По взаимному согласованию с другим участником обмена;</li>
              <li>
                По вине другого участника в случае нарушения условий соглашения или бездействия. К сожалению, мы не
                несём ответственность за действия пользователей, однако вы можете оставить отзыв и оценку в разделе
                «Завершённые обмены» для информирования других пользователей о действиях данного участника обмена;
              </li>
              <li>
                По вашей вине. Если соглашение о завершении не достигнуто, другой участник также вправе повлиять на ваш
                рейтинг.
              </li>
            </ul>
          </Flex>
        </Card>

        <Flex gap="small" align="center" justify="center">
          <Button
            color="orange"
            variant="solid"
            style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
            onClick={handleCancel}
          >
            Завершить обмен
          </Button>
          <Button
            onClick={() => setOpen(false)}
            color="default"
            variant="outlined"
            style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
          >
            Отмена
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}
