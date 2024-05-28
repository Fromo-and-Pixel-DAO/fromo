import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import ItemGrid from '@components/ListItems/ItemGrid'
import NoData from '@components/NoData'
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
    <Box p="0 40px" pb="100px">
      <Text mt="16px" fontSize="32px" fontWeight="800" lineHeight="36px">
        NFT Pool
      </Text>
      {gameNft.nftList.length > 0 ? (
        <SimpleGrid mt="52px" columns={[1, 2, 3, 4, 5]} spacing="20px">
          {gameNft.nftList.map((item, idx) => {
            return <ItemGrid gridName="finishedList" item={item} key={idx} />
          })}
        </SimpleGrid>
      ) : (
        <Flex
          h="calc(100vh - 410px)"
          justifyContent="center"
          alignItems="center">
          <NoData />
        </Flex>
      )}
    </Box>
  )
}

export default NFTpool
