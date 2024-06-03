import { lazy, Suspense, useEffect, useMemo, useState } from 'react'

import { Box, Text, Flex, SimpleGrid, Spinner } from '@chakra-ui/react'
import ItemGrid from '@components/ListItems/ItemGrid'

import TabsCommon from '@components/TabsCommon'

import { getMyParticipationGames } from 'packages/service/api'
import { INftList } from 'packages/service/api/types'
import useStore from 'packages/store'
import useFomoStore from 'packages/store/fomo'
import Footer from '@components/Footer'

const Sidebar = lazy(() => import('@modules/Profile/Sidebar'))
const Header = lazy(() => import('@modules/Profile/Header'))

export default function Main() {
  const { address } = useStore()
  const { userHeaderInfo } = useFomoStore()
  const [isLoading, setIsLoading] = useState(false)

  const [gameNft, setGameNft] = useState<INftList>({
    total: 0,
    nftList: [],
  })

  const ongoingList = useMemo(() => {
    return gameNft.nftList.filter((item) => item.status === 1)
  }, [gameNft])

  const finishedList = useMemo(() => {
    return gameNft.nftList.filter((item) => item.status === 2)
  }, [gameNft])

  const fetchList = async () => {
    setIsLoading(true)
    getMyParticipationGames(address)
      .then((res) => {
        if (res) {
          setGameNft(res)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchList()
  }, [])

  const renderTabs = [
    {
      id: 1,
      title: `All Auctions`,
      value: 'allList',
      render: (
        <SimpleGrid mt="20px" columns={[1, 2, 3, 3, 4]} spacing="20px">
          {gameNft.nftList.map((item, idx) => {
            return <ItemGrid gridName="allList" item={item} key={idx} />
          })}
        </SimpleGrid>
      ),
    },
    {
      id: 2,
      title: `Ongoing`,
      value: 'ongoingList',
      render: (
        <SimpleGrid mt="20px" columns={[1, 2, 3, 3, 4]} spacing="20px">
          {ongoingList.map((item, idx) => {
            return <ItemGrid gridName="ongoingList" item={item} key={idx} />
          })}
        </SimpleGrid>
      ),
    },
    {
      id: 3,
      title: `Finished`,
      value: 'finishedList',
      render: (
        <SimpleGrid mt="20px" columns={[1, 2, 3, 3, 4]} spacing="20px">
          {finishedList.map((item, idx) => {
            return <ItemGrid gridName="finishedList" item={item} key={idx} />
          })}
        </SimpleGrid>
      ),
    },
  ]
  return (
    <Box minH="calc(100vh - 85px)">
      <Flex minH="70vh">
        <Sidebar />
        <Box
          w="calc(100% - 328px)"
          flex="1"
          minW={{ base: 'full', md: '500px' }}>
          {isLoading ? (
            <Flex
              minH="70vh"
              textAlign="center"
              w="100%"
              h={{ base: 'auto', md: 'calc(100vh - 293px)' }}
              justifyContent="center"
              alignItems="center">
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            </Flex>
          ) : (
            <>
              <Box minH="70vh" textAlign="center">
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
                  <Box
                    p={{
                      base: '32px 16px',
                      md: '32px 20px',
                      xl: '36px 68px 40px 0px',
                    }}>
                    <Text
                      textAlign="start"
                      fontSize={{ base: '24px', md: '28px', xl: '32px' }}
                      lineHeight="36px"
                      fontWeight="800"
                      mb="32px">
                      My Participation
                    </Text>
                    <TabsCommon initTab="allList" renderTabs={renderTabs} />
                  </Box>
                </Suspense>
              </Box>
              <Footer />
            </>
          )}
        </Box>
      </Flex>
    </Box>
  )
}
