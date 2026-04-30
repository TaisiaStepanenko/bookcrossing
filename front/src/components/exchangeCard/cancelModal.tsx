import { Button, Flex, Modal, Typography } from 'antd'

export const CancelModal = ({ setOpen, cancel }: { setOpen: (open: boolean) => void; cancel: () => void }) => {
  return (
    <Modal open onCancel={() => setOpen(false)} footer={null}>
      <Flex vertical gap="middle">
        <Typography.Title level={3}>Действительно ли вы хотите досрочно завершить обмен?</Typography.Title>
        <Typography.Text>Досрочное завершение обмена возможно в следующих случаях:</Typography.Text>
        <ul>
          <li>По взаимному согласованию с другим участником обмена;</li>
          <li>
            По вине другого участника в случае нарушения условий соглашения или бездействия. К сожалению, мы не несём
            ответственность за действия пользователей, однако вы можете оставить отзыв и оценку в разделе «Завершённые
            обмены» для информирования других пользователей о действиях данного участника обмена;
          </li>
          <li>
            По вашей вине. Если соглашение о завершении не достигнуто, другой участник также вправе повлиять на ваш
            рейтинг.
          </li>
        </ul>
        <Flex gap="small">
          <Button color="orange" variant="solid" onClick={cancel}>
            Завершить обмен
          </Button>
          <Button onClick={() => setOpen(false)} color="default" variant="outlined">
            Отмена
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}
