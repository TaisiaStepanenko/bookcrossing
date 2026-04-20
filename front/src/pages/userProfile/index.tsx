import { useParams } from 'react-router-dom'

import { Container } from '../../components/common/container'
import { UserProfile } from '../../components/userProfile'

export const UserProfilePage = () => {
  const { id } = useParams()

  return (
    <Container>
      <UserProfile id={id} />
    </Container>
  )
}
