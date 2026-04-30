import { useNavigate } from 'react-router-dom'

import { Button, Flex, Typography } from 'antd'

import Adv from '../../assets/adv.png'
import Book1 from '../../assets/book1.png'
import Book2 from '../../assets/book2.png'
import Book3 from '../../assets/book3.png'
import Book4 from '../../assets/book4.png'
import Book5 from '../../assets/book5.png'
import BookCrossing from '../../assets/bookcrossing.png'
import HowItWorks from '../../assets/howItWorks.png'
import MoreBooks from '../../assets/moreBooks.png'
import { Container } from '../../components/common/container'

export const HomePage = () => {
  const navigate = useNavigate()

  return (
    <Container>
      <div style={{ width: '100%', maxWidth: 1200 }}>
        <Flex vertical style={{ paddingTop: 96, width: '100%' }} align="center" gap={'large'}>
          <img src={BookCrossing} width={800} />
          <Typography.Text style={{ textAlign: 'center' }}>
            Меняйтесь книгами с читателями из своего города
            <br /> или любого уголка России.
          </Typography.Text>
          <Button color="default" variant="solid" onClick={() => navigate(`/catalog`)}>
            Книги рядом
          </Button>
          <Flex gap="large" style={{ height: 604 }}>
            <img width={348} height={460} src={Book1} />
            <img width={348} height={460} src={Book2} style={{ alignSelf: 'center' }} />
            <img width={348} height={460} src={Book3} style={{ alignSelf: 'flex-end' }} />
            <img width={348} height={460} src={Book4} style={{ alignSelf: 'center' }} />
            <img width={348} height={460} src={Book5} />
          </Flex>
          <img src={Adv} style={{ padding: 285 }} />
          <img src={HowItWorks} style={{ padding: 140 }} />
          <img src={MoreBooks} style={{ padding: 140 }} />
        </Flex>
      </div>
    </Container>
  )
}
