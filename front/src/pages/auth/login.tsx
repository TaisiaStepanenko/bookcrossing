import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Col, DatePicker, Row, Select, Typography } from 'antd'
import dayjs from 'dayjs'

import { useGetCities, useLogin, useRegistration } from '../../api/hooks'
import type { Login, Registration } from '../../api/models'
import { AuthContainer } from '../../components/authContainer'
import { CustomDatePicker } from '../../components/DatePicker'
import { TextField } from '../../components/ui/Input'
import { CustomSelect } from '../../components/ui/Select'

export const LoginPage = () => {
  const navigate = useNavigate()
  const login = useLogin()
  const cities = useGetCities()
  const [data, setData] = useState<Login>({
    email: '',
    password: '',
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
  const isShowError = !data.email || !data.password || validateEmail(data?.email || '')

  const onSave = () => {
    const { email, password } = data

    if (!email || !password) {
      return setIsError('Введите обязательные поля!')
    } else if (validateEmail(email)) {
      return setIsError('Введите корректную почту')
    } else {
      validateEmail(email)
      setIsError('')
      login
        .mutateAsync(data)
        .then((response) => {
          localStorage.setItem('token', response.token) // сохраняем токен
          navigate('/catalog') // перенаправление
        })
        .catch((error) => {
          // обработка ошибки уже есть
        })
    }
  }

  const translateErrorMessage = (error: any): string => {
    const message = error?.response?.data?.message

    if (message === 'Invalid password') return 'Неверный пароль'
    if (message === 'User is not registered or email is wrong')
      return 'Пользователь не зарегистрирован или email указан неверно'
    if (message === 'Password must be at least 6 characters') return 'Пароль должен содержать не менее 6 символов'
    if (message === 'Email is invalid') return 'Некорректный email'

    return message || 'Произошла ошибка, попробуйте позже'
  }

  return (
    <AuthContainer>
      <div style={{ width: '100%' }}>
        <Row gutter={[20, 20]}>
          <Col span={24} style={{ marginBottom: '12px' }}>
            <Typography.Title level={2} style={{ fontSize: '28px', fontWeight: 600, marginBottom: 4, lineHeight: 1.2 }}>
              Авторизация
            </Typography.Title>
            <Typography.Link
              style={{ color: '#6B6B6B', textDecoration: 'underline', fontSize: '16px', marginBottom: '12px' }}
              onClick={() => navigate('/registration')}
            >
              Ещё нет аккаунта?
            </Typography.Link>
          </Col>

          <Col span={24}>
            <TextField
              onChange={(e) => onChange('email', e.target.value)}
              value={data.email || ''}
              type="email"
              label="Электронная почта"
              placeholder="Введите эл. почту"
              required
            />
          </Col>

          <Col span={24}>
            <TextField
              onChange={(e) => onChange('password', e.target.value)}
              value={data.password || ''}
              label="Пароль"
              placeholder="Введите пароль"
              required
            />
          </Col>

          {((isShowError && isError) || login.error) && (
            <Col span={24}>
              <Typography.Text type="danger">
                {(() => {
                  const err = login.error as any

                  if (err?.response?.data?.errors) {
                    return err.response.data.errors.map((e: { message: string }) => e.message).join(', ')
                  }

                  return translateErrorMessage(err) || isError
                })()}
              </Typography.Text>
            </Col>
          )}
          <Col span={24}>
            <Button
              type="primary"
              color="primary"
              style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2, marginTop: '12px' }}
              onClick={onSave}
            >
              Авторизоваться
            </Button>
          </Col>
        </Row>
      </div>
    </AuthContainer>
  )
}
