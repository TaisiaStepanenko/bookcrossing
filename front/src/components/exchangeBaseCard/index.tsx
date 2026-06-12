import { Avatar, Button, Card, Flex, Image, Typography } from 'antd'

import { useRejectAll } from '../../api/hooks'
import type { IncomingAllExchanges } from '../../api/models'

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
    <Card style={{ width: '100%', borderRadius: 20 }} styles={{ body: { padding: '20px 20px' } }}>
      <Flex gap={32}>
        <Image src={`${process.env.VITE_API_URL}${data.src}`} height={240} width={160} style={{ objectFit: 'cover' }} />
        <Flex vertical justify="space-between">
          <Flex vertical gap="large">
            <Typography.Title level={2}>{data.name}</Typography.Title>
            <Flex vertical gap={12}>
              <Typography.Text>
                {data.exchangeType === 'FREE'
                  ? `${data.people.length} человек хотят получить книгу`
                  : `${data.people.length} человек хотят обменяться`}
              </Typography.Text>
              <Avatar.Group size={32}>
                {data.people.map((p) => (
                  <a href={`/profile/user/${p.id}`} target="_blank" rel="noreferrer">
                    <Avatar
                      style={{ backgroundColor: '#f56a00', fontSize: 16 }}
                      src={`${process.env.VITE_API_URL}${p.avatar}`}
                    >
                      {p.name[0]}
                    </Avatar>
                  </a>
                ))}
              </Avatar.Group>
            </Flex>
          </Flex>
          <Flex gap="small">
            <Button
              color="default"
              variant="solid"
              style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
              onClick={() => setExchange({ id: data.id, name: data.name })}
            >
              Узнать больше
            </Button>
            <Button
              color="orange"
              variant="outlined"
              style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
              onClick={() => mutate.mutate()}
            >
              Отклонить всё
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
