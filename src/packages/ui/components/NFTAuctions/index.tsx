'use client'

import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import ItemGrid from 'packages/ui/components/ListItems/ItemGrid'

import NoData from '@components/NoData'
import useFomoStore from 'packages/store/fomo'

import { Suspense } from 'react'

import { Spinner } from '@chakra-ui/react'

export default function NFTAuctions() {
  const { gameList, upcomingList, ongoingList, finishedList, getNftAuctions } =
    useFomoStore()

  return (
    <>
      <Suspense
        fallback={
          <Box mt="300px">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Box>
        }>
        {gameList.length === 0 ? (
          <NoData />
        ) : (
          <>
            <Box
              px={{ base: '20px', md: '24px', lg: '32px', xl: '48px' }}
              mt={{ base: '40px', xl: '80px' }}>
              <Box>
                <Flex
                  fontSize={{ base: '20px', md: '24px', xl: '28px' }}
                  fontWeight="800"
                  alignItems="center"
                  height="32px"
                  marginBottom="20px"
                  gap="8px">
                  <Text>Ongoing NFT Auctions</Text>({ongoingList.length})
                </Flex>
              </Box>
              {ongoingList.length > 0 && (
                <Flex gap="20px" overflow="auto" pb="8px">
                  {ongoingList?.map((item, idx) => {
                    return (
                      <ItemGrid
                        isOngoingList
                        gridName="ongoingList"
                        item={item}
                        key={idx}
                      />
                    )
                  })}
                </Flex>
              )}
            </Box>

            <Box
              px={{
                base: '20px',
                sm: '80px',
                md: '24px',
                lg: '32px',
                xl: '48px',
              }}
              mt={{ base: '40px', xl: '80px' }}>
              <Box>
                <Flex
                  fontSize={{ base: '20px', md: '24px', xl: '28px' }}
                  fontWeight="800"
                  alignItems="center"
                  height="32px"
                  marginBottom="20px"
                  gap="8px">
                  <Text>Upcoming NFT Auctions</Text>({upcomingList.length})
                </Flex>
              </Box>
              {upcomingList.length > 0 && (
                <SimpleGrid columns={[1, 1, 2, 3, 5, 5]} spacing="20px">
                  {upcomingList?.map((item, idx) => {
                    return (
                      <ItemGrid
                        isUpcoming
                        gridName="upcomingList"
                        item={item}
                        key={idx}
                      />
                    )
                  })}
                </SimpleGrid>
              )}
            </Box>

            {finishedList.length > 0 && (
              <Box
                px={{
                  base: '20px',
                  sm: '80px',
                  md: '24px',
                  lg: '32px',
                  xl: '48px',
                }}
                mt={{ base: '40px', xl: '80px' }}>
                <Box>
                  <Flex
                    fontSize={{ base: '20px', md: '24px', xl: '28px' }}
                    fontWeight="800"
                    alignItems="center"
                    height="32px"
                    marginBottom="20px"
                    gap="8px">
                    <Text>Finished NFT Auctions</Text>({finishedList.length})
                  </Flex>
                </Box>
                <SimpleGrid columns={[1, 1, 2, 3, 5, 5]} spacing="20px">
                  {finishedList?.map((item, idx) => {
                    return (
                      <ItemGrid gridName="finishedList" item={item} key={idx} />
                    )
                  })}
                </SimpleGrid>
              </Box>
            )}
          </>
        )}
      </Suspense>
    </>
  )
}
