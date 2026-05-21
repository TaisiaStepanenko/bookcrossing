import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Col, DatePicker, Row, Select, Typography } from 'antd'
import dayjs from 'dayjs'

import { useGetCities, useRegistration } from '../../api/hooks'
import type { Registration } from '../../api/models'
import { AuthContainer } from '../../components/authContainer'
import { CustomDatePicker } from '../../components/DatePicker'
import { TextField } from '../../components/ui/Input'
import { CustomSelect } from '../../components/ui/Select'

export const RegistrationPage = () => {
  const navigate = useNavigate()
  const registration = useRegistration()
  const cities = useGetCities()
  const [data, setData] = useState<Registration>({
    name: null,
    email: null,
    birthday_date: null,
    password: null,
    description: null,
    cityId: null,
  })
  const onChange = (name: any, value: any) => setData({ ...data, [name]: value })
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/

    if (!value || !emailRegex.test(value)) {
      return true
    } else {
      return false
    }
  }
  const [isError, setIsError] = useState('')
  const isShowError =
    !data.name ||
    !data.email ||
    !data.birthday_date ||
    !data.password ||
    !data.description ||
    !data.cityId ||
    validateEmail(data?.email || '')

  const onSave = () => {
    const { name, email, birthday_date, password, cityId } = data

    if (!name || !email || !birthday_date || !password || !cityId) {
      return setIsError('Введите обязательные поля!')
    } else if (validateEmail(email)) {
      return setIsError('Введите корректную почту')
    } else {
      validateEmail(email)
      setIsError('')
      registration.mutateAsync({ ...data, birthday_date: dayjs(data.birthday_date).format('YYYY-MM-DD') })
    }
  }

  const translateErrorMessage = (error: any): string => {
    const message = error?.response?.data?.message

    if (message === 'User already exists') return 'Пользователь с таким email уже существует'
    if (message === 'Invalid password') return 'Неверный пароль'
    if (message === 'Password must be at least 6 characters') return 'Пароль должен содержать не менее 6 символов'
    if (message === 'Email is invalid') return 'Введите корректную почту'

    return message
  }

  return (
    <AuthContainer>
      <div style={{ width: '100%' }}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <Typography.Title>Регистрация</Typography.Title>
            <Typography.Link style={{ color: 'black', textDecoration: 'underline' }} onClick={() => navigate('/login')}>
              Есть аккаунт?
            </Typography.Link>
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
              onChange={(v) => onChange('birthday_date', v)}
              value={data.birthday_date ? dayjs(data.birthday_date) : null}
              label="Дата рождения"
              placeholder="Введите дату"
              format="DD.MM.YYYY"
              required
            />
          </Col>
          <Col span={12}>
            <TextField
              onChange={(e) => onChange('password', e.target.value)}
              value={data.password || ''}
              label="Пароль"
              placeholder="Введите пароль"
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
          {((isShowError && isError) || registration.error) && (
            <Col span={24}>
              <Typography.Text color="var(--ant-red)" style={{ color: 'var(--ant-red)' }}>
                {((isShowError && isError) || registration.error) && (
                  <Col span={24}>
                    <Typography.Text type="danger">
                      {(() => {
                        const err = registration.error as any

                        if (err?.response?.data?.errors) {
                          return err.response.data.errors.map((e: { message: string }) => e.message).join(', ')
                        }

                        return translateErrorMessage(err) || isError
                      })()}
                    </Typography.Text>
                  </Col>
                )}
              </Typography.Text>
            </Col>
          )}
          <Col span={24}>
            <Button
              color="primary"
              onClick={onSave}
              // disabled={isShowError && Boolean(isError)}
            >
              Зарегистрироваться
            </Button>
          </Col>
        </Row>
      </div>
    </AuthContainer>
  )
}
