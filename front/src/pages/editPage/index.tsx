import { useEffect, useState } from 'react'

import { Button, Col, Flex, Row, Typography } from 'antd'
import dayjs from 'dayjs'

import { useGetCities, useGetProfile, useUpdateProfile } from '../../api/hooks'
import type { UserProfile } from '../../api/models'
import changeProfile from '../../assets/changeProfile.png'
import { Container } from '../../components/common/container'
import { CustomDatePicker } from '../../components/DatePicker'
import { TextField } from '../../components/ui/Input'
import { CustomSelect } from '../../components/ui/Select'

import styles from './styles.module.scss'

export const EditProfilePage = () => {
  const [data, setData] = useState<UserProfile>({} as any)
  const query = useGetProfile('')
  const { mutateAsync } = useUpdateProfile()
  const cities = useGetCities()

  useEffect(() => {
    if (query.data) {
      setData(query.data)
    }
  }, [query.data])

  const onChange = (name: any, value: any) => setData({ ...data, [name]: value })

  const onSave = () => {
    mutateAsync({
      birthdayDate: data.birthdayDate,
      cityId: data.cityId,
      name: data.name,
      email: data.email,
      description: data.description,
      phone: data.phone,
    })
  }

  return (
    <Container>
      <Flex align="center">
        <div className={styles.card}>
          <div style={{ width: '285px' }}>
            <img src={changeProfile} alt="" className={styles['card-img']} />
          </div>
          <div className={styles['card-content']}>
            <div style={{ width: '100%' }}>
              <Row gutter={[20, 20]}>
                <Col span={24}>
                  <Typography.Title>Профиль пользователя</Typography.Title>
                </Col>
                <Col span={12}>
                  <TextField
                    onChange={(e) => onChange('name', e.target.value)}
                    value={data.name || ''}
                    label="Имя"
                    placeholder="Введите имя"
                    required
                  />
                </Col>
                <Col span={12}>
                  <TextField
                    onChange={(e) => onChange('email', e.target.value)}
                    value={data.email || ''}
                    type="email"
                    label="Электронная почта"
                    placeholder="Введите эл. почту"
                    required
                  />
                </Col>
                <Col span={12}>
                  <CustomDatePicker
                    onChange={(v) => onChange('birthdayDate', v)}
                    value={data.birthdayDate ? dayjs(data.birthdayDate) : null}
                    label="Дата рождения"
                    placeholder="Введите дату"
                    format="DD.MM.YYYY"
                    required
                  />
                </Col>
                <Col span={12}>
                  <TextField
                    onChange={(e) => onChange('phone', e.target.value)}
                    value={data.phone || ''}
                    label="Номер телефона"
                    placeholder="Введите номер телефона"
                    required
                  />
                </Col>
                <Col span={24}>
                  <TextField
                    onChange={(e) => onChange('description', e.target.value)}
                    value={data.description || ''}
                    label="О себе"
                    placeholder="Расскажите о себе"
                    required
                    rows={3}
                  />
                </Col>
                <Col span={12}>
                  <CustomSelect
                    onChange={(v) => onChange('cityId', v)}
                    value={data.cityId}
                    label="Город"
                    required
                    placeholder="Введите город"
                    style={{ width: '100%' }}
                    options={(cities.data || []).map(({ cityId, name }) => ({ value: cityId, label: name }))}
                  />
                </Col>

                <Col span={24}>
                  <Button
                    color="primary"
                    onClick={onSave}
                    // disabled={isShowError && Boolean(isError)}
                  >
                    Обновить
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Flex>
    </Container>
  )
}
