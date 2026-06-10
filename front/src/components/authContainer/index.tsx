import { Flex } from 'antd'

import leftImage from '../../assets/auth-left.png'
import { Container } from '../common/container'

import styles from './style.module.scss'

export const AuthContainer = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Container fullHeight={false}>
      <Flex align="center" style={{ height: 702, marginTop: 109 }}>
        <div className={styles.card}>
          <div style={{ width: '285px' }}>
            <img src={leftImage} alt="" className={styles['card-img']} />
          </div>
          <div className={styles['card-content']}>{children}</div>
        </div>
      </Flex>
    </Container>
  )
}
