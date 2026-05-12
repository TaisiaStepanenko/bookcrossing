import React, { useEffect, useState } from 'react'

import { CameraOutlined, DeleteOutlined } from '@ant-design/icons'

import { type GetProp, Image, message, Upload, type UploadFile, type UploadProps } from 'antd'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

interface AddPhotosProps {
  fileList: UploadFile[]
  setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>
  deletedPhotos?: string[]
  setDeletedPhotos?: React.Dispatch<React.SetStateAction<string[]>>
}

export const AddPhotos = ({
  fileList,
  setFileList,
  deletedPhotos = [],
  setDeletedPhotos = () => {},
}: AddPhotosProps) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  useEffect(() => {
    return () => {
      fileList.forEach((file) => {
        if (file.url?.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
      })
    }
  }, [fileList])

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  const beforeUpload = (file: FileType) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'

    if (!isImage) {
      message.error('Можно загружать только JPG/PNG файлы!')

      return false
    }

    const isLt5M = file.size / 1024 / 1024 < 5

    if (!isLt5M) {
      message.error('Файл должен быть меньше 5MB!')

      return false
    }

    const newFile: UploadFile = {
      uid: file.uid,
      name: file.name,
      status: 'done',
      originFileObj: file as any,
      url: URL.createObjectURL(file),
    }

    setFileList((prev) => [...prev, newFile])

    return false
  }

  const handleRemove = (file: UploadFile) => {
    if (file.existingUrl) {
      setDeletedPhotos((prev) => [...prev, file.existingUrl!])
    }

    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }

    setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
    message.success('Фото удалено')
  }

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <CameraOutlined />
      <div style={{ marginTop: 8 }}>Загрузить</div>
    </button>
  )

  return (
    <>
      <div>
        <div style={{ marginBottom: 8 }}>Фотографии книги (максимальное количество фотографий 7)</div>
        <Upload
          listType="picture-card"
          fileList={fileList.map((file) => {
            // Для существующих фото добавляем полный URL для отображения
            if (file.existingUrl && file.url && !file.url.startsWith('blob:')) {
              return {
                ...file,
                url: `${import.meta.env.VITE_API_URL}${file.existingUrl}`,
              }
            }

            return file
          })}
          onPreview={handlePreview}
          onChange={handleChange}
          beforeUpload={beforeUpload}
          onRemove={handleRemove}
          multiple
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
        <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
          Поддерживаются форматы JPG, PNG. Максимальный размер файла 5MB
        </div>
      </div>

      {previewImage && (
        <Image
          style={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </>
  )
}
