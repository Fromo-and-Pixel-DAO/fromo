import { Box, Divider, Flex, Text, useBreakpointValue } from '@chakra-ui/react'

const rulesList = [
  {
    title: 'Final Winner Prize:',
    description:
      'The last key holder gets 20% of the total mint fee. The prize can be claimed after the game gets over.',
  },
  {
    title: 'Key Holder Dividends:',
    description:
      'Key holders share 20% of following mint fee depends on held key share. The dividends can be claimed during and after the game.',
  },
  {
    title: 'NFT Provider Dividends:',
    description:
      'The NFT provider shares 50% of the total mint fee. The dividends can be claimed after the game.  ',
  },
]

export default function Footer() {
  const customOrientation: 'horizontal' | 'vertical' =
    useBreakpointValue({
      base: 'horizontal',
      md: 'vertical',
    }) ?? 'horizontal'

  return (
    <Box px={{ base: '16px', xl: '80px' }} mt="60px">
      <Text
        fontWeight="600"
        fontSize={{ base: '18px', xl: '16px' }}
        lineHeight="20px"
        mb="20px"
        textAlign="center">
        Auction Rules
      </Text>
      <Flex direction={{ base: 'column', md: 'row' }}>
        {rulesList.map((i, k) => (
          <Flex direction={{ base: 'column', md: 'row' }} key={k}>
            <Box textAlign="center">
              <Text
                fontSize="14px"
                color="#7E4AF1"
                lineHeight="16px"
                fontWeight="600"
                mb="8px">
                {i.title}
              </Text>
              <Text
                fontSize="12px"
                color="rgba(255,255,255, 0.8)"
                lineHeight="16px">
                {i.description}
              </Text>
            </Box>
            <Divider
              display={k !== 2 ? '' : 'none'}
              orientation={customOrientation}
              h={{ base: '1px', md: '56px' }}
              mx={{ base: 'auto', md: '20px' }}
              my={{ base: '8px', md: '0px' }}
            />
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}
