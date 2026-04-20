import { Flex, Select, type SelectProps, Typography } from 'antd'

export const CustomSelect = ({
  label,
  rows,
  required,
  ...props
}: SelectProps & { required?: boolean; label?: string; rows?: number }) => {
  return (
    <Flex vertical>
      {label && (
        <Flex>
          <Typography.Text type="secondary">{label}</Typography.Text>
          {required && <Typography.Text style={{ color: 'var(--ant-red)' }}>*</Typography.Text>}
        </Flex>
      )}
      <Select {...props} />
    </Flex>
  )
}
