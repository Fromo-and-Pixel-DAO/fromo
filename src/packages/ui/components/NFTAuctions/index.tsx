'use client'

import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import NoData from '@components/NoData'
import useFomoStore from 'packages/store/fomo'
import ItemGrid from 'packages/ui/components/ListItems/ItemGrid'

import { Suspense, useRef, useState } from 'react'

import { Spinner } from '@chakra-ui/react'
import IconNext from '@components/Icon/icon-next'
import { useWindowSize } from '@hooks/useWindowSize'

export default function NFTAuctions() {
  const { width } = useWindowSize()
  const { gameList, upcomingList, ongoingList, finishedList, getNftAuctions } =
    useFomoStore()
  const boxInnerRef = useRef()

  const handleScroll = (direction: string) => {
    const box = boxInnerRef.current
    const scrollAmount = box.offsetWidth / 2

    if (direction === 'right') {
      box.scrollTo({
        left: box.scrollLeft + scrollAmount,
        behavior: 'smooth',
      })
    } else {
      box.scrollTo({
        left: box.scrollLeft - scrollAmount,
        behavior: 'smooth',
      })
    }
  }

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
                <Box>
                  <Box
                    position="relative"
                    width="100%"
                    h={{ base: '402px', md: '212px' }}
                    overflow="hidden">
                    <Box
                      width="40px"
                      height="40px"
                      left={{ base: '5%', md: '5%', xl: '3%' }}
                      zIndex={10}
                      bottom={{ base: '45%', md: '40%' }}
                      cursor="pointer"
                      _hover={{ opacity: '0.8' }}
                      transform="rotate(180deg)"
                      pos="absolute"
                      onClick={() => handleScroll('left')}>
                      <IconNext />
                    </Box>
                    <Box
                      width="40px"
                      height="40px"
                      left={{ base: '83%', md: '90%', xl: '94%' }}
                      zIndex={10}
                      bottom={{ base: '40.5%', md: '32%' }}
                      cursor="pointer"
                      _hover={{ opacity: '0.8' }}
                      transform="translateY(-50%)"
                      pos="absolute"
                      onClick={() => handleScroll('right')}>
                      <IconNext />
                    </Box>

                    <Box
                      ref={boxInnerRef}
                      width="100%"
                      gap="20px"
                      display="flex"
                      sx={{
                        '::-webkit-scrollbar': {
                          display: 'none',
                        },
                        'scrollbar-width': 'none',
                        '-ms-overflow-style': 'none',
                        'scroll-behavior': 'smooth',
                      }}
                      position="absolute"
                      whiteSpace="nowrap"
                      overflowY="hidden"
                      overflowX="scroll">
                      {ongoingList.map((item, idx) => (
                        <Box key={idx}>
                          <ItemGrid
                            isOngoingList
                            gridName="ongoingList"
                            item={item}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
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
