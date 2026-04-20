import React, { type InputHTMLAttributes } from 'react'

import { Flex, Input, type InputProps, Typography } from 'antd'

export const TextField = ({ label, rows, required, ...props }: InputProps & { label?: string; rows?: number }) => {
  return (
    <Flex vertical>
      {label && (
        <Flex>
          <Typography.Text type="secondary">{label}</Typography.Text>
          {required && <Typography.Text style={{ color: 'var(--ant-red)' }}>*</Typography.Text>}
        </Flex>
      )}
      {!rows ? <Input {...props} /> : <Input.TextArea rows={rows} {...(props as any)} />}
    </Flex>
  )
}
