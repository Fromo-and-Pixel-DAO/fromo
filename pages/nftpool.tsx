import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import ItemGrid from '@components/ListItems/ItemGrid'
import { getNftPoolList } from 'packages/service/api'
import { INftList } from 'packages/service/api/types'
import { useEffect, useState } from 'react'

const NFTpool = () => {
  const [gameNft, setGameNft] = useState<INftList>({
    total: 0,
    nftList: [],
  })

  useEffect(() => {
    getNftPoolList(1).then((res) => {
      if (res) {
        setGameNft(res)
      }
    })
  }, [])

  return (
    <Box p="0 40px" pb="200px">
      <Flex mt="40px" mb="20px" fontSize="20px" align="center" color="#00DAB3">
        <Text
          fontSize="24px"
          lineHeight="36px"
          textShadow="0px 0px 10px rgba(0, 218, 179, 1)">
          NFT Pool{' '}
        </Text>
        <Text ml="8px" fontSize="18px" lineHeight="27px">
          {' '}
          - {gameNft.total} NFTs available
        </Text>
      </Flex>
      <Box mb="24px" w="100%" height="1px" bg="rgba(112, 75, 234, 0.5)"></Box>
      <SimpleGrid mt="20px" columns={[1, 2, 3, 4, 5]} spacing="20px">
        {gameNft.nftList.map((item, idx) => {
          return <ItemGrid gridName="finishedList" item={item} key={idx} />
        })}
      </SimpleGrid>
    </Box>
  )
}

export default NFTpool
