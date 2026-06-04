import { Flex, Select, type SelectProps, Typography } from 'antd'

const CustomArrow = () => (
  <svg
    width="22"
    height="12"
    viewBox="0 0 22 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <path d="M1 1L11 11L21 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const CustomSelect = ({ label, required, ...props }: SelectProps & { required?: boolean; label?: string }) => {
  return (
    <Flex vertical>
      {label && (
        <Flex>
          <Typography.Text type="secondary">{label}</Typography.Text>
          {required && <Typography.Text style={{ color: 'var(--ant-red)' }}>*</Typography.Text>}
        </Flex>
      )}
      <Select size="large" style={{ borderRadius: '4px' }} suffixIcon={<CustomArrow />} {...props} />
    </Flex>
  )
}
