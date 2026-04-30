import { Avatar, Button, Card, Flex, Image, Typography } from 'antd'

import { useRejectAll } from '../../api/hooks'
import type { IncomingAllExchanges } from '../../api/models'
import testImg from '../../assets/testImg.png'

export const ExchangeBaseCard = ({
  setExchange,
  data,
}: {
  data: IncomingAllExchanges
  setExchange: React.Dispatch<
    React.SetStateAction<{
      id: string
      name: string
    }>
  >
}) => {
  const mutate = useRejectAll(data.id)

  return (
    <Card style={{ width: '100%' }}>
      <Flex gap="medium">
        <Image src={`${import.meta.env.VITE_API_URL}${data.src}`} height={240} />
        <Flex vertical justify="space-between">
          <Flex vertical>
            <Typography.Title level={4}>{data.name}</Typography.Title>
            <Typography.Text>{data.people.length} человек хотят обменяться</Typography.Text>
            <Avatar.Group>
              {data.people.map((p) => (
                <a href={`/profile/user/${p.id}`} target="_blank" rel="noreferrer">
                  <Avatar style={{ backgroundColor: '#f56a00' }} src={`${import.meta.env.VITE_API_URL}${p.avatar}`}>
                    {p.name[0]}
                  </Avatar>
                </a>
              ))}
            </Avatar.Group>
          </Flex>
          <Flex gap="small">
            <Button color="default" variant="solid" onClick={() => setExchange({ id: data.id, name: data.name })}>
              Узнать больше
            </Button>
            <Button color="orange" variant="outlined" onClick={() => mutate.mutate()}>
              Отклонить всё
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
