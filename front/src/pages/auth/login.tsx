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

  return (
    <AuthContainer>
      <div style={{ width: '100%' }}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <Typography.Title>Авторизация</Typography.Title>
            <Typography.Link
              style={{ color: 'black', textDecoration: 'underline' }}
              onClick={() => navigate('/registration')}
            >
              Регистрация
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
              <Typography.Text color="var(--ant-red)" style={{ color: 'var(--ant-red)' }}>
                {login.error?.response?.data?.errors.map(({ message }) => `${message}, `) || isError}
              </Typography.Text>
            </Col>
          )}
          <Col span={24}>
            <Button color="primary" onClick={onSave}>
              Войти
            </Button>
          </Col>
        </Row>
      </div>
    </AuthContainer>
  )
}
