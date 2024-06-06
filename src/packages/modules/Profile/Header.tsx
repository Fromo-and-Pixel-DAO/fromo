import { Box, Flex, Text } from '@chakra-ui/react'

import { useWindowSize } from '@hooks/useWindowSize'

type HeaderProps = {
  title?: string
  quantity?: number
  headers: any
  button?: JSX.Element
  noBorder?: boolean
}
export default function Header({
  headers,
  button,
  title,
  quantity,
  noBorder = false,
}: HeaderProps) {
  const { width } = useWindowSize()

  return (
    <Flex
      flexDirection={{ base: 'column', lg: 'row' }}
      gap={{ base: '10px', lg: '30px', xl: '110px' }}
      borderBottom={noBorder ? 'none' : '1px solid #704BEA80'}
      alignItems={{ xl: 'center' }}
      py={{ base: '5px', lg: 'none' }}
      h={{ base: 'none', lg: '60px', xl: '90px' }}>
      {title && (
        <Flex
          flexDir={{ base: 'column', lg: 'column' }}
          ml={{ base: '20px', lg: 'none' }}>
          <Box fontSize={`${width > 768 ? '20px' : '16px'}`} fontWeight="bold">
            {title}
          </Box>
          {quantity && (
            <Text
              fontSize={`${width > 768 ? '12px' : '10px'}`}
              color="#FFA8FE"
              justifyContent="center">
              {`${quantity} total`}
            </Text>
          )}
        </Flex>
      )}

      <Flex
        gap={{ md: '120px', lg: '40px', xl: '60px' }}
        pt={{ base: '5px', lg: 'none' }}
        borderTop={{ base: '1px solid', lg: 'unset' }}
        borderTopColor="#704BEA80">
        {headers.map((item, idx) => (
          <Box key={idx} ml={{ base: '20px', lg: 'none' }}>
            <Box fontSize={`${width > 768 ? '12px' : '10px'}`} color="#FFA8FE">
              {item.name}
            </Box>
            <Flex
              alignItems="center"
              gap="4px"
              fontSize={`${width > 768 ? '14px' : '12px'}`}
              fontWeight="bold">
              <Text
                fontSize={`${width > 768 ? '12px' : '10px'}`}
                color="#FFFFFF">
                {idx === 0 && item.number && item.unit}
              </Text>
              {item.number}
              <Text
                fontSize={`${width > 768 ? '10px' : '8px'}`}
                color="#FFFFFF">
                {idx !== 0 && item.number && item.unit}
              </Text>
            </Flex>
          </Box>
        ))}
      </Flex>
      {button}
    </Flex>
  )
}
