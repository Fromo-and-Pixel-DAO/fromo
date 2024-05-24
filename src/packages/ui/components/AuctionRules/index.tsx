import { Box, Divider, Flex, Text } from '@chakra-ui/react'

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

export default function AuctionRules() {
  return (
    <Box p="60px 80px">
      <Text fontWeight="600" lineHeight="20px" mb="20px" textAlign="center">
        AuctionRules
      </Text>
      <Flex>
        {rulesList.map((i, k) => (
          <Flex key={k}>
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
              orientation="vertical"
              h="56px"
              mx="20px"
            />
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}
