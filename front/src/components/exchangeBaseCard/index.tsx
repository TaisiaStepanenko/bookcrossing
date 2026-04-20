import { Avatar, Button, Card, Flex, Image, Typography } from 'antd'

import testImg from '../../assets/testImg.png'

export const ExchangeBaseCard = ({
  setExchange,
}: {
  setExchange: React.Dispatch<
    React.SetStateAction<{
      id: string
      name: string
    }>
  >
}) => (
  <Card style={{ width: '100%' }}>
    <Flex gap="medium">
      <Image src={testImg} height={240} />
      <Flex vertical justify="space-between">
        <Flex vertical>
          <Typography.Title level={4}>Гарри Поттер и Принц-полукровка</Typography.Title>
          <Typography.Text>29 человек хотят обменяться</Typography.Text>
          <Avatar.Group>
            <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
            <a href="https://ant.design">
              <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
            </a>
            <a href="https://ant.design">
              <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
            </a>
          </Avatar.Group>
        </Flex>
        <Flex gap="small">
          <Button
            color="default"
            variant="solid"
            onClick={() => setExchange({ id: '1', name: 'Гарри Поттер и Принц-полукровка' })}
          >
            Узнать больше
          </Button>
          <Button color="orange" variant="outlined">
            Отклонить всё
          </Button>
        </Flex>
      </Flex>
    </Flex>
  </Card>
)
