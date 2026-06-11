import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Col, Flex, message, Row, Typography, type UploadFile } from 'antd'

import { useAddBook, useGetBook, useUpdateBook, useUserInfo } from '../../api/hooks'
import { BOOK_CONDITION, BOOK_COVER, type BookEdit, EXCHANGE_METHOD, EXCHANGE_TYPE } from '../../api/models'
import addBook from '../../assets/addBook.png'
import { AddPhotos } from '../../components/addPhotos'
import { Container } from '../../components/common/container'
import { TextField } from '../../components/ui/Input'
import { CustomSelect } from '../../components/ui/Select'
import { GENRE_OPTIONS } from './consts'

import styles from './style.module.scss'

export const AddBookPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [page, setPage] = useState(1)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [deletedPhotos, setDeletedPhotos] = useState<string[]>([])
  const [data, setData] = useState<BookEdit>({})

  const { data: bookData, isLoading } = useGetBook(Number(id))
  const { mutate: addMutate, isPending: isAdding } = useAddBook()
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateBook()
  const { data: userInfo } = useUserInfo()

  useEffect(() => {
    if (bookData && isEditMode) {
      if (!bookData.isMy) {
        message.error('Вы не можете редактировать эту книгу')
        navigate('/catalog')

        return
      }
      setData({
        name: bookData.name,
        author: bookData.author,
        exchangeType: bookData.exchangeType,
        exchangeMethod: bookData.exchangeMethod,
        condition: bookData.condition,
        defects: bookData.defects || '',
        genre: bookData.genre,
        cover: bookData.cover,
        publisherHouse: bookData.publisherHouse,
        year: bookData.year,
        series: bookData.series,
        description: bookData.description,
        obtainingMethod: bookData.obtainingMethod,
      })

      if (bookData.photos && bookData.photos.length > 0) {
        const existingFiles: UploadFile[] = bookData.photos.map((photo, index) => ({
          uid: `existing-${index}-${Date.now()}`,
          name: photo.url.split('/').pop() || `photo-${index}`,
          status: 'done',
          url: `${process.env.VITE_API_URL}${photo.url}`, // Полный URL для отображения
          existingUrl: photo.url, // Сохраняем относительный URL для отправки на сервер
          isMain: photo.isMain,
        }))

        setFileList(existingFiles)
      }
    }
  }, [bookData, isEditMode, navigate])

  const onSubmit = () => {
    if (
      !data.name ||
      !data.author ||
      !data.genre ||
      !data.cover ||
      !data.condition ||
      !data.exchangeMethod ||
      !data.exchangeType
    ) {
      message.error('Пожалуйста, заполните все обязательные поля')

      return
    }

    const validFiles = fileList.filter((file) => {
      if (!file.originFileObj && !file.existingUrl) {
        console.warn('Файл без данных:', file)

        return false
      }

      return true
    })

    const formData = new FormData()

    // Подготавливаем данные для отправки
    const submitData: any = { ...data }

    if (submitData.year) {
      submitData.year = Number(submitData.year)
    }

    // Добавляем список удаленных фото
    if (deletedPhotos.length > 0) {
      submitData.deletedPhotos = deletedPhotos
    }

    formData.append('data', JSON.stringify(submitData))

    // Добавляем новые файлы
    validFiles.forEach((file) => {
      if (file.originFileObj) {
        formData.append('photos', file.originFileObj)
      }
    })

    if (isEditMode) {
      updateMutate(
        { id: Number(id), data: formData },
        {
          onSuccess: () => {
            message.success('Книга успешно обновлена')
            navigate(`/book/${id}`)
          },
          onError: (error) => {
            message.error('Ошибка при обновлении книги')
            console.error(error)
          },
        },
      )
    } else {
      addMutate(formData, {
        onSuccess: () => {
          message.success('Книга успешно добавлена')
          navigate('/catalog')
          setData({})
          setFileList([])
          setPage(1)
        },
        onError: (error) => {
          message.error('Ошибка при добавлении книги')
          console.error(error)
        },
      })
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setData({
      ...data,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value,
    })
  }

  const isPending = isAdding || isUpdating

  if (isLoading && isEditMode) {
    return (
      <Container>
        <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
          <Typography.Title level={3}>Загрузка...</Typography.Title>
        </Flex>
      </Container>
    )
  }

  return (
    <Container fullHeight={false}>
      <Flex align="center" style={{ height: '702px', marginTop: 69 }}>
        <div className={styles.card}>
          <div style={{ width: '285px' }}>
            <img src={addBook} alt="" className={styles['card-img']} />
          </div>
          <div className={styles['card-content']}>
            <div style={{ width: '100%' }}>
              <div style={{ width: '100%' }}>
                {page === 1 && (
                  <Row gutter={[20, 20]}>
                    <Col span={24} style={{ marginBottom: 12 }}>
                      <Typography.Title level={2} style={{ fontWeight: 600, marginBottom: 4, lineHeight: 1.2 }}>
                        {isEditMode ? 'Редактирование книги' : 'Добавление книги'}
                      </Typography.Title>
                      <Typography.Link style={{ color: '#6B6B6B', fontSize: 16 }}>Информация о книге</Typography.Link>
                    </Col>

                    <Col span={12}>
                      <TextField
                        onChange={onChange}
                        label="Название"
                        required
                        placeholder="Введите название"
                        name="name"
                        value={data.name || ''}
                      />
                    </Col>
                    <Col span={12}>
                      <TextField
                        onChange={onChange}
                        name="author"
                        value={data.author || ''}
                        label="Автор"
                        required
                        placeholder="Введите автора"
                      />
                    </Col>

                    <Col span={12}>
                      <CustomSelect
                        onChange={(v) => setData({ ...data, genre: v })}
                        mode="multiple"
                        allowClear
                        value={data.genre}
                        label="Жанр книги"
                        required
                        placeholder="Введите жанр книги"
                        options={GENRE_OPTIONS}
                      />
                    </Col>
                    <Col span={12}>
                      <CustomSelect
                        onChange={(v) => setData({ ...data, cover: v })}
                        value={data.cover}
                        label="Тип обложки"
                        placeholder="Выберете тип обложки"
                        required
                        style={{ width: '100%' }}
                        options={Object.values(BOOK_COVER).map(({ en, ru }) => ({ value: en, label: ru }))}
                      />
                    </Col>
                    <Col span={12}>
                      <TextField
                        onChange={onChange}
                        name="publisherHouse"
                        value={data.publisherHouse || ''}
                        label="Издательство"
                        placeholder="Введите наименование издательства"
                      />
                    </Col>
                    <Col span={12}>
                      <TextField
                        onChange={onChange}
                        name="year"
                        value={data.year || ''}
                        label="Год издания"
                        placeholder="Введите год издания"
                        type="number"
                      />
                    </Col>
                    <Col span={12}>
                      <TextField
                        onChange={onChange}
                        name="series"
                        value={data.series || ''}
                        label="Серия"
                        placeholder="Введите название серии книг"
                      />
                    </Col>

                    <Col span={24}>
                      <TextField
                        onChange={onChange}
                        name="description"
                        value={data.description || ''}
                        label="Описание"
                        placeholder="Расскажите о книге"
                        rows={3}
                      />
                    </Col>
                    <Col span={24} style={{ marginTop: '12px' }}>
                      <Flex gap="small">
                        <Button
                          color="default"
                          variant="outlined"
                          style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
                          onClick={() => navigate(-1)}
                        >
                          Назад
                        </Button>

                        <Button
                          color="primary"
                          type="primary"
                          style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
                          onClick={() => setPage(2)}
                          disabled={isPending}
                        >
                          Далее
                        </Button>
                      </Flex>
                    </Col>
                  </Row>
                )}
                {page === 2 && (
                  <Row gutter={[20, 20]}>
                    <Col span={24} style={{ marginBottom: 12 }}>
                      <Typography.Title level={2} style={{ fontWeight: 600, marginBottom: 12, lineHeight: 1.2 }}>
                        {isEditMode ? 'Редактирование книги' : 'Добавление книги'}
                      </Typography.Title>
                      <Typography.Link style={{ color: '#6B6B6B', fontSize: 16 }}>
                        Информация о состоянии экземпляра и доставке
                      </Typography.Link>
                    </Col>

                    <Col span={12}>
                      <CustomSelect
                        onChange={(v) => setData({ ...data, condition: v })}
                        value={data.condition}
                        label="Состояние"
                        placeholder="Выберете состояние книги"
                        required
                        style={{ width: '100%' }}
                        options={Object.values(BOOK_CONDITION).map(({ en, ru }) => ({ value: en, label: ru }))}
                      />
                    </Col>
                    <Col span={12}>
                      <TextField
                        onChange={onChange}
                        name="defects"
                        value={data.defects || ''}
                        label="Дефекты"
                        placeholder="Опишите дефекты"
                      />
                    </Col>
                    <Col span={12}>
                      <CustomSelect
                        onChange={(v) => setData({ ...data, exchangeMethod: v })}
                        value={data.exchangeMethod}
                        label="Способы обмена"
                        required
                        placeholder="Выберете способ обмена"
                        style={{ width: '100%' }}
                        options={Object.values(EXCHANGE_METHOD).map(({ en, ru }) => ({ value: en, label: ru }))}
                      />
                    </Col>
                    <Col span={12}>
                      <CustomSelect
                        onChange={(v) => setData({ ...data, exchangeType: v })}
                        value={data.exchangeType}
                        label="Желаете получить книгу в обмен?"
                        required
                        placeholder="Выберете тип обмена"
                        style={{ width: '100%' }}
                        options={Object.values(EXCHANGE_TYPE).map(({ en, ru }) => ({ value: en, label: ru }))}
                      />
                    </Col>

                    <Col span={24}>
                      <TextField
                        onChange={onChange}
                        name="obtainingMethod"
                        value={data.obtainingMethod || ''}
                        label="Способы получения"
                        placeholder="Опишите подробнее способы получения книги"
                        rows={3}
                      />
                    </Col>
                    <Col span={24}>
                      <AddPhotos
                        fileList={fileList}
                        setFileList={setFileList}
                        deletedPhotos={deletedPhotos}
                        setDeletedPhotos={setDeletedPhotos}
                      />
                    </Col>
                    <Col span={24} style={{ marginTop: '12px' }}>
                      <Flex gap="small">
                        <Button
                          color="default"
                          variant="outlined"
                          style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
                          onClick={() => setPage(1)}
                          disabled={isPending}
                        >
                          Назад
                        </Button>
                        <Button
                          color="primary"
                          type="primary"
                          style={{ padding: '12px 32px', height: 'auto', lineHeight: 1.2 }}
                          onClick={onSubmit}
                          loading={isPending}
                        >
                          {isEditMode ? 'Сохранить' : 'Добавить'}
                        </Button>
                      </Flex>
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          </div>
        </div>
      </Flex>
    </Container>
  )
}
