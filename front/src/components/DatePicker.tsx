import { DatePicker, type DatePickerProps, Flex, Typography } from 'antd'
import locale from 'antd/es/date-picker/locale/ru_RU'

export const CustomDatePicker = ({
  label,
  required,
  placeholder,
  ...props
}: DatePickerProps & { required?: boolean; label?: string }) => {
  return (
    <Flex vertical>
      {label && (
        <Flex>
          <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
            {label}
          </Typography.Text>
          {required && <Typography.Text style={{ color: 'var(--ant-red)' }}>*</Typography.Text>}
        </Flex>
      )}
      <DatePicker
        locale={locale}
        placeholder={placeholder || 'ДД.ММ.ГГГГ'}
        size="large"
        style={{ borderRadius: '4px' }}
        styles={{
          input: { fontSize: '16px' },
        }}
        {...props}
      />
    </Flex>
  )
}
