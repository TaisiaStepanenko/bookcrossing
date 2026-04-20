// PhotoGallery.tsx
import React, { useState } from 'react'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'

import { Carousel, Flex, Image, Modal, Typography } from 'antd'

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
  const lenght = list.length - 3

  return (
    <Image.PreviewGroup>
      <Flex vertical gap="small" className={styles['img-box']}>
        <Image width={'100%'} height={436} alt="svg image" src={`${import.meta.env.VITE_API_URL}${mainPicture}`} />
        {secondPicture && (
          <Flex gap="small">
            {secondPicture ? (
              <Image
                width={'calc(100% / 3)'}
                height={88}
                alt="svg image"
                src={`${import.meta.env.VITE_API_URL}${secondPicture}`}
                style={{ objectFit: 'cover', border: undefined }}
              />
            ) : (
              <div className={styles['no-img']} />
            )}
            {thirdPicture ? (
              <Image
                width={'calc(100% / 3)'}
                height={88}
                alt="svg image"
                src={`${import.meta.env.VITE_API_URL}${thirdPicture}`}
                style={{ objectFit: 'cover', border: undefined }}
              />
            ) : (
              <div className={styles['no-img']} />
            )}

            <Flex className={styles['no-img']} align="center" justify="center">
              <Typography.Title level={3} style={{ color: 'white', margin: 0 }}>
                +{lenght}
              </Typography.Title>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Image.PreviewGroup>
  )
}
