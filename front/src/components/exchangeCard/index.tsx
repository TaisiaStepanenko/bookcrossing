import { useState } from 'react'

import { Avatar, Button, Card, Flex, Image, Typography } from 'antd'

import Arrows from '../../assets/arrows.png'
import testImg from '../../assets/testImg.png'

import styles from './styles.module.scss'

export const ExchangeCard = ({ type }: { type: 'ALL' | 'ONE' }) => {
  const [selected, setSelected] = useState('')

  return (
    <Card style={{ width: '100%' }}>
      <Flex vertical gap="middle">
        <Flex gap="small">
          <Avatar />
          <Flex vertical>
            <Typography.Title style={{ margin: 0 }} level={4}>
              Маша предлагает обмен!
            </Typography.Title>
            <Typography.Text>{type === 'ALL' ? 'Все 3 книги на 1 вашу' : '1 из 3 книг на выбор'}</Typography.Text>
          </Flex>
        </Flex>
        <Flex gap="small" align="center">
          <Image src={testImg} height={240} width={178} />
          <Image src={Arrows} height={80} width={69} />
          <Image
            onClick={() => setSelected('1')}
            src={testImg}
            className={type === 'ALL' || selected === '1' ? styles.selected : undefined}
            preview={false}
            height={240}
            width={178}
          />
          <Image
            onClick={() => setSelected('2')}
            src={testImg}
            className={type === 'ALL' || selected === '2' ? styles.selected : undefined}
            preview={false}
            height={240}
            width={178}
          />
          <Image
            onClick={() => setSelected('3')}
            src={testImg}
            className={type === 'ALL' || selected === '3' ? styles.selected : undefined}
            preview={false}
            height={240}
            width={178}
          />
        </Flex>
        <Flex gap="middle">
          <Flex vertical>
            <Typography.Title style={{ margin: 0 }} level={4}>
              Вы отдаете
            </Typography.Title>
            <Typography.Text>Гарри Поттер и Принц-полукровка</Typography.Text>
          </Flex>
          <Flex vertical>
            <Typography.Title style={{ margin: 0 }} level={4}>
              Вы получаете
            </Typography.Title>
            <Typography.Text>1. Гарри Поттер и Принц-полукровка</Typography.Text>
            <Typography.Text>2. Гарри Поттер и Принц-полукровка</Typography.Text>
            <Typography.Text>3. Гарри Поттер и Принц-полукровка</Typography.Text>
          </Flex>
        </Flex>
        <Flex gap="small">
          <Button color="default" disabled={type === 'ONE' && !selected} variant="solid">
            Обменяться
          </Button>
          <Button color="orange" variant="outlined">
            Отклонить всё
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}
