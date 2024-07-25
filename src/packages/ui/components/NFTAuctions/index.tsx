'use client'

import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import NoData from '@components/NoData'
import useFomoStore from 'packages/store/fomo'
import ItemGrid from 'packages/ui/components/ListItems/ItemGrid'

import { Suspense, useState } from 'react'

import { Spinner } from '@chakra-ui/react'
import IconNext from '@components/Icon/icon-next'
import { useWindowSize } from '@hooks/useWindowSize'

export default function NFTAuctions() {
  const { width } = useWindowSize()
  const { gameList, upcomingList, ongoingList, finishedList, getNftAuctions } =
    useFomoStore()
  const [currentIndex, setCurrentIndex] = useState(0)

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
              <Box h={{ base: '430px', md: '226px' }} overflow="hidden">
                <Box pos="relative" overflowX="auto">
                  {ongoingList.length > 0 && (
                    <Flex
                      w="fit-content"
                      gap="20px"
                      pb="8px"
                      sx={{
                        '::-webkit-scrollbar': {
                          display: 'none',
                        },
                        'scrollbar-width': 'none',
                        '-ms-overflow-style': 'none',
                      }}
                      style={{
                        transform: `translateX(-${
                          width > 768 ? currentIndex * 50 : currentIndex * 100
                        }%)`,
                        transition: 'transform 0.5s ease-in-out',
                      }}>
                      {ongoingList.map((item, idx) => (
                        <Box key={idx} minW="fit-content">
                          <ItemGrid
                            isOngoingList
                            gridName="ongoingList"
                            item={item}
                          />
                        </Box>
                      ))}
                    </Flex>
                  )}

                  {currentIndex > 0 && (
                    <Box
                      width="40px"
                      height="40px"
                      left={{ base: '5%', md: '5%', xl: '3%' }}
                      zIndex={10}
                      bottom={{
                        base: currentIndex > 0 ? '53.8%' : '50%',
                        md: currentIndex > 0 ? '56.5%' : '50%',
                      }}
                      cursor="pointer"
                      _hover={{ opacity: '0.8' }}
                      transform="translateY(-50%) rotate(180deg)"
                      pos="sticky"
                      onClick={() => setCurrentIndex(currentIndex - 1)}>
                      <IconNext />
                    </Box>
                  )}

                  {ongoingList.length > 0 && (
                    <Box
                      width="40px"
                      display={{
                        base: ongoingList.length >= 2 ? 'block' : 'none',
                        md: ongoingList.length >= 2 ? 'block' : 'none',
                        lg:
                          ongoingList.length >= 2 && width >= 1024
                            ? ongoingList.length >= 3
                              ? 'block'
                              : 'none'
                            : 'block',
                        xl: ongoingList.length >= 3 ? 'block' : 'none',
                      }}
                      height="40px"
                      left={{ base: '83%', md: '90%', xl: '94%' }}
                      zIndex={10}
                      bottom={{
                        base: currentIndex > 0 ? '53.8%' : '50%',
                        md: currentIndex > 0 ? '56.5%' : '50%',
                      }}
                      cursor="pointer"
                      _hover={{ opacity: '0.8' }}
                      transform="translateY(-50%)"
                      pos="sticky"
                      onClick={() => setCurrentIndex(currentIndex + 1)}>
                      <IconNext />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

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
