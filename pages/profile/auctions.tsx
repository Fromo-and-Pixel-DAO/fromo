import { lazy, Suspense, useEffect, useState } from 'react'

import { Box, Flex, SimpleGrid, Spinner } from '@chakra-ui/react'
import ItemGrid from '@components/ListItems/ItemGrid'

import TabsCommon from '@components/TabsCommon'

import { useWindowSize } from '@hooks/useWindowSize'
import useFomoStore from 'packages/store/fomo'
import { getMyAuctions } from 'packages/service/api'
import useStore from 'packages/store'
import { INftList } from 'packages/service/api/types'

const ListItems = lazy(() => import('@components/ListItems'))
const Sidebar = lazy(() => import('@modules/Profile/Sidebar'))
const Header = lazy(() => import('@modules/Profile/Header'))

export default function Main() {
  const { width } = useWindowSize()

  const { address } = useStore()
  const { userHeaderInfo } = useFomoStore()
  const [isLoading, setIsLoading] = useState(false)
  const [gameNft, setGameNft] = useState<INftList>({
    total: 0,
    nftList: [],
  })

  let upcomingList = gameNft.nftList.filter((item) => item.status === 0)
  let ongoingList = gameNft.nftList.filter((item) => item.status === 1)
  let finishedList = gameNft.nftList.filter((item) => item.status === 2)

  const fetchList = async () => {
    setIsLoading(true)
    getMyAuctions(address)
      .then((res) => {
        setGameNft(res)
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
      id: 0,
      title: `All Auctions (${gameNft.total})`,
      value: 'allList',
      render: (
        <SimpleGrid mt="20px" columns={[1, 2, 3, 4]} spacing="20px">
          {gameNft.nftList.map((item, idx) => {
            return <ItemGrid gridName="allList" item={item} key={idx} />
          })}
        </SimpleGrid>
      ),
    },
    {
      id: 1,
      title: `Queuing Auctions (${upcomingList.length})`,
      value: 'upcomingList',
      render: (
        <SimpleGrid mt="20px" columns={[1, 2, 3, 4]} spacing="20px">
          {upcomingList.map((item, idx) => {
            return <ItemGrid gridName="upcomingList" item={item} key={idx} />
          })}
        </SimpleGrid>
      ),
    },
    {
      id: 2,
      title: `Ongoing Auctions (${ongoingList.length})`,
      value: 'finishedList',
      render: (
        <SimpleGrid mt="20px" columns={[1, 2, 3, 4]} spacing="20px">
          {ongoingList.map((item, idx) => {
            return <ItemGrid gridName="finishedList" item={item} key={idx} />
          })}
        </SimpleGrid>
      ),
    },
    {
      id: 3,
      title: `Finished Auctions (${finishedList.length})`,
      value: 'ongoingList',
      render: (
        <SimpleGrid mt="20px" columns={[1, 2, 3, 4]} spacing="20px">
          {finishedList.map((item, idx) => {
            return <ItemGrid gridName="ongoingList" item={item} key={idx} />
          })}
        </SimpleGrid>
      ),
    },
  ]
  return (
    <Flex>
      <Sidebar />
      <Box flex="1" minW={{ base: 'full', md: '500px' }}>
        <Header headers={userHeaderInfo} />
        {isLoading ? (
          <Flex
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
          <Box textAlign="center">
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
              <Box p="25px 50px">
                <TabsCommon initTab="allList" renderTabs={renderTabs} />
              </Box>
            </Suspense>
          </Box>
        )}
      </Box>
    </Flex>
  )
}
