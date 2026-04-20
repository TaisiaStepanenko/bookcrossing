import { DatePicker, type DatePickerProps, Flex, Typography } from 'antd'

export const CustomDatePicker = ({
  label,
  rows,
  required,
  ...props
}: DatePickerProps & { required?: boolean; label?: string; rows?: number }) => {
  return (
    <Flex vertical>
      {label && (
        <Flex>
          <Typography.Text type="secondary">{label}</Typography.Text>
          {required && <Typography.Text style={{ color: 'var(--ant-red)' }}>*</Typography.Text>}
        </Flex>
      )}
      <DatePicker locale={{ lang: { locale: 'ru' } }} {...props} />
    </Flex>
  )
}
