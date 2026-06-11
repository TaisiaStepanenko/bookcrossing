// PhotoGallery.tsx
import React, { useState } from 'react'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'

import { Carousel, Flex, Image, Modal, Typography } from 'antd'

import BookImg from '../../assets/placeholder-book.png'

import styles from './style.module.scss'

interface PhotoItem {
  isMain: boolean
  url: string
}

interface PhotoGalleryProps {
  photos: PhotoItem[]
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  const list = photos.sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1))
  const mainPicture = list[0]?.url
  const secondPicture = list[1]?.url
  const thirdPicture = list[2]?.url
  const remainingCount = list.length - 3

  if (!mainPicture) {
    return (
      <Flex vertical gap="small" className={styles['img-box']}>
        <Image width="100%" height={436} src={BookImg} alt="Нет фото" fallback={BookImg} />
      </Flex>
    )
  }

  return (
    <Image.PreviewGroup>
      <Flex vertical gap="small" className={styles['img-box']}>
        <Flex style={{ backgroundColor: '#7F7F7F' }}>
          <Image width="100%" height={436} alt="svg image" src={`${process.env.VITE_API_URL}${mainPicture}`} />
        </Flex>
        {secondPicture && (
          <Flex gap="small" style={{ width: '100%' }}>
            {secondPicture && (
              <Image
                width={'calc(100% / 3)'}
                height={100}
                alt="svg image"
                src={`${process.env.VITE_API_URL}${secondPicture}`}
                style={{ objectFit: 'cover', border: undefined }}
              />
            )}
            {thirdPicture && (
              <Image
                width={'calc(100% / 3)'}
                height={100}
                alt="svg image"
                src={`${process.env.VITE_API_URL}${thirdPicture}`}
                style={{ objectFit: 'cover', border: undefined }}
              />
            )}
            {remainingCount > 0 && (
              <Flex className={styles['no-img']} align="center" justify="center" style={{ height: 100 }}>
                <Typography.Title style={{ color: 'white', margin: 0, fontSize: 32, fontWeight: 500 }}>
                  +{remainingCount}
                </Typography.Title>
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </Image.PreviewGroup>
  )
}
