import { Suspense, lazy, useEffect, useState } from 'react'

import {
  AbsoluteCenter,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import ItemGrid from 'packages/ui/components/ListItems/ItemGrid'
// import { sleep } from '@utils'

import NoData from '@components/NoData'
import { faker } from '@faker-js/faker'
import { ethers } from 'ethers'
import moment from 'moment'
import { useRouter } from 'next/router'
import { ErrorIcon } from 'packages/assets/ErrorIcon'
import SuccessIcon from 'packages/assets/SuccessIcon'
import { getStakeNotices, getSysBrief } from 'packages/service/api'
import { IGameInfo } from 'packages/service/api/types'
import useStore from 'packages/store'
import useAuctions, { ActivityStatus } from 'packages/store/auctions'
import useFomoStore from 'packages/store/fomo'
import React from 'react'
import { Flip, toast } from 'react-toastify'
// import BidderModal from '@modules/Market/Main/BidderModal'

const BidderModal = lazy(() => import('@modules/Market/Main/BidderModal'))

// TODO

// const ListItems = lazy(() => import('@components/ListItems'))

export const generateTimestamp = () => {
  const randomDays = faker.number.int({ min: 1, max: 9 })
  const randomHours = faker.number.int({ min: 0, max: 23 })
  const randomMinutes = faker.number.int({ min: 0, max: 59 })
  const randomSeconds = faker.number.int({ min: 0, max: 59 })

  const futureDate = moment()
    .add(randomDays, 'days')
    .hour(randomHours)
    .minute(randomMinutes)
    .second(randomSeconds)

  return futureDate.valueOf() / 1000
}

export default function Main() {
  const router = useRouter()

  const { address } = useStore()

  const [open, setOpen] = useState(false)

  const { gameList, upcomingList, ongoingList, finishedList, getNftAuctions } =
    useFomoStore()

  const { auctionInfo, getAuctionInfo } = useAuctions()

  const [sysInfo, setSysInfo] = useState<IGameInfo>({
    tokenPrice: '-',
    totalKeyMinted: '-',
    totalMintFee: '-',
    totalPrize: '-',
    totalProfits: '-',
    totalGames: '-',
  })

  const List = () => {
    if (gameList.length === 0) return <NoData />

    return (
      <>
        {ongoingList.length > 0 && (
          <Box px="42px" mt="80px">
            <Box>
              <Flex
                fontSize="28px"
                fontWeight="800"
                alignItems="center"
                height="32px"
                marginBottom="40px"
                gap="8px">
                <Text>Ongoing NFT Auctions</Text>({ongoingList.length})
              </Flex>
            </Box>
            <SimpleGrid columns={[1, 2, 2, 3, 5, 6]} spacing="20px">
              {ongoingList?.map((item, idx) => {
                return <ItemGrid gridName="ongoingList" item={item} key={idx} />
              })}
            </SimpleGrid>
          </Box>
        )}

        {upcomingList.length > 0 && (
          <Box px="42px" mt="80px">
            <Box>
              <Flex
                fontSize="28px"
                fontWeight="800"
                alignItems="center"
                height="32px"
                marginBottom="40px"
                gap="8px">
                <Text>Upcoming NFT Auctions</Text>({upcomingList.length})
              </Flex>
            </Box>
            <SimpleGrid columns={[1, 2, 2, 3, 5, 6]} spacing="20px">
              {upcomingList?.map((item, idx) => {
                return (
                  <ItemGrid gridName="upcomingList" item={item} key={idx} />
                )
              })}
            </SimpleGrid>
          </Box>
        )}

        {finishedList.length > 0 && (
          <Box px="42px" mt="80px">
            <Box>
              <Flex
                fontSize="28px"
                fontWeight="800"
                alignItems="center"
                height="32px"
                marginBottom="40px"
                gap="8px">
                <Text>Finished NFT Auctions</Text>({finishedList.length})
              </Flex>
            </Box>
            <SimpleGrid columns={[1, 2, 2, 3, 5, 6]} spacing="20px">
              {finishedList?.map((item, idx) => {
                return (
                  <ItemGrid gridName="finishedList" item={item} key={idx} />
                )
              })}
            </SimpleGrid>
          </Box>
        )}
      </>
    )
  }

  const fetchSysBrief = async () => {
    const data = await getSysBrief()
    setSysInfo(data)
  }

  useEffect(() => {
    getAuctionInfo()
    getNftAuctions()
    fetchSysBrief()
  }, [])

  const onClose = () => {
    getAuctionInfo()
    setOpen(false)
  }

  useEffect(() => {
    if (auctionInfo && address) {
      if (
        auctionInfo &&
        auctionInfo.status === ActivityStatus.Staking &&
        auctionInfo.bidWinnerAddress === address.toLocaleLowerCase()
      ) {
        toast.warning(
          'You won the FROMO plot, stake your NFT now and start your own gamified NFT auction.',
          {
            icon: React.createElement(SuccessIcon),
            toastId: 'bidWinner',
            position: toast.POSITION.TOP_CENTER,
            transition: Flip,
            autoClose: false,
          },
        )
      }
      getStakeNotices(address)
        .then((res) => {
          if (res > 0) {
            toast.error(
              `You lost the $OMO you bid because you failed to stake NFT.`,
              {
                icon: React.createElement(ErrorIcon),
                toastId: 'stakeNotice',
                position: toast.POSITION.TOP_CENTER,
                transition: Flip,
                autoClose: false,
              },
            )
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [auctionInfo, address])

  if (!auctionInfo) return null

  const OMO_Metrics = [
    {
      title: '$OMO Price',
      data: parseFloat(sysInfo?.tokenPrice).toFixed(4) || '-',
    },
    {
      title: ' Total Mint Fee',
      icon: (
        <Image
          src="/static/common/eth-index.svg"
          alt="ethereum"
          w="14px"
          h="24px"
          mr="8px"
        />
      ),
      data: sysInfo?.totalKeyMinted !== '-' ? sysInfo?.totalKeyMinted : '-',
      data2: sysInfo?.totalMintFee !== '-' ? sysInfo?.totalMintFee : '-',
    },
    {
      title: 'Total Prize & Dividends',
      icon: (
        <Image
          src="/static/common/eth-index.svg"
          alt="ethereum"
          w="14px"
          h="24px"
          mr="8px"
        />
      ),
      data:
        sysInfo?.totalProfits !== '-'
          ? parseFloat(ethers.utils.formatEther(sysInfo?.totalProfits)).toFixed(
              4,
            )
          : '-',
      data2: sysInfo?.totalPrize !== '-' ? sysInfo?.totalPrize : '-',
    },
    {
      title: 'Total NFTs Auctioned',
      data: sysInfo?.totalGames !== '-' ? sysInfo?.totalGames : '-',
    },
  ]

  return (
    <Box alignItems="center" mb="50px">
      <Box pt="60px" px="48px" position="relative">
        <Box mt="58px">
          <Text className="stroked-text">
            <Flex className="stroked-text-gradient" ml="-6px" p="10px">
              Start Your NFT Auction :
            </Flex>
          </Text>
          <Text
            fontSize="48px"
            fontWeight="extrabold"
            mt="10px"
            mb="40px"
            lineHeight="56px">
            Bid Fromo Plot to <br /> Start a Gamified NFT Auction
          </Text>

          {sysInfo && (
            <Flex mb="120px">
              {OMO_Metrics.map((i, k) => (
                <Flex key={k} ml={k === 0 ? '' : '28px'}>
                  <Box>
                    <Text lineHeight="20px" mb="8px" fontWeight="semibold">
                      {i.title}
                    </Text>
                    <Flex alignItems="center">
                      {i.icon}
                      <Flex
                        fontWeight="extrabold"
                        fontSize="32px"
                        lineHeight="36px"
                        color="#1DFED6">
                        {k === 0 && <span>$</span>} {i.data}
                      </Flex>
                    </Flex>
                    {/* {i.data2 && (
                      <Flex
                        
                        fontWeight="extrabold"
                        fontSize="20px"
                        lineHeight="36px"
                        color="#1DFED6">
                        <span>$</span> {i.data2}
                      </Flex>
                    )} */}
                  </Box>
                  {k !== 3 && (
                    <Divider
                      ml="28px"
                      orientation="vertical"
                      borderWidth="1px"
                      h="64px"
                      borderColor="#9A7CFF"
                    />
                  )}
                </Flex>
              ))}
            </Flex>
          )}

          <Flex
            pos="relative"
            bg="#7E4AF1"
            py="28px"
            px="25px"
            fontSize="24px"
            lineHeight="28px"
            fontWeight="800"
            borderRadius="full">
            <Flex gap="28px" w="50%">
              <Tooltip
                label={
                  ActivityStatus.Staking === auctionInfo.status ? (
                    <>
                      {' '}
                      {auctionInfo.bidWinnerAddress === address ? (
                        <>
                          {' '}
                          You won the FROMO plot and the chance to auction NFT
                          on
                          {moment(auctionInfo.startTimestamp).format(
                            'MMMM DD, ha',
                          )}
                          GMT{' '}
                        </>
                      ) : (
                        <>
                          {' '}
                          The NFT auction will start on
                          {moment(auctionInfo.startTimestamp)
                            .add(8, 'hours')
                            .format('MMMM DD, ha')}
                          GMT{' '}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {' '}
                      Get the chance to auction NFT on
                      {moment(auctionInfo.startTimestamp).format(
                        'MMMM DD, ha',
                      )}{' '}
                      GMT by bidding a plot of FroopyLand：
                    </>
                  )
                }>
                <Image
                  src="/static/common/help.svg"
                  w="28px"
                  h="28px"
                  alt="help"
                />
              </Tooltip>
              <Flex gap="4px">
                <Text>Highest Bid</Text>
                <Text>: </Text>
                <Box>
                  {parseFloat(`${auctionInfo?.highestBid}`).toFixed(2) || '--'}
                </Box>
                <Text>$OMO</Text>
              </Flex>
              <Box>
                {Number(auctionInfo.biddersCount) === 0
                  ? 0
                  : auctionInfo.biddersCount || '--'}{' '}
                Bidders
              </Box>
            </Flex>
            <Box w="50%" alignItems="center">
              <Flex gap="12px" ml="200px">
                <Image
                  src="/static/common/timer.svg"
                  w="28px"
                  h="28px"
                  alt="timer"
                />
                <Box>
                  {[ActivityStatus.NotStarted, ActivityStatus.Bidding].includes(
                    auctionInfo.status,
                  ) && (
                    <>
                      {auctionInfo.status === ActivityStatus.NotStarted &&
                        `Open on ${moment(auctionInfo.startTimestamp).format(
                          'MMMM DD, Ha',
                        )}`}
                      {auctionInfo.status === ActivityStatus.Bidding &&
                        `Close on ${moment(auctionInfo.startTimestamp)
                          .add(16, 'hours')
                          .format('MMMM DD, Ha')}`}
                    </>
                  )}

                  {auctionInfo.status === ActivityStatus.Staking &&
                    ` Close on
                    ${moment(auctionInfo.startTimestamp)
                      .add(8, 'hours')
                      .format('MMMM DD, ha')}`}
                </Box>
              </Flex>
            </Box>
            <AbsoluteCenter>
              {/* NotStarted or Bidding */}
              {[ActivityStatus.NotStarted, ActivityStatus.Bidding].includes(
                auctionInfo.status,
              ) && (
                <Button
                  h="100%"
                  borderRadius="full"
                  bg="transparent"
                  cursor="pointer"
                  _hover={{}}
                  _focus={{}}
                  onClick={() => setOpen(true)}
                  isDisabled={ActivityStatus.NotStarted === auctionInfo.status}
                  pos="relative">
                  <Image
                    src="/static/common/3d.svg"
                    borderRadius="full"
                    alt="3d"
                    pos="relative"
                  />
                  <AbsoluteCenter _hover={{ opacity: 0.7 }}>
                    <Text
                      textAlign="center"
                      fontWeight="black"
                      fontSize="40px"
                      lineHeight="40px">
                      BID <br /> plot
                    </Text>
                  </AbsoluteCenter>
                </Button>
              )}
              {/* Staking */}
              {ActivityStatus.Staking === auctionInfo.status && (
                <>
                  {auctionInfo.bidWinnerAddress === address ? (
                    <Button
                      h="100%"
                      borderRadius="full"
                      bg="transparent"
                      cursor="pointer"
                      _hover={{}}
                      _focus={{}}
                      onClick={() => router.push('/stakeNFT')}
                      pos="relative">
                      <Image
                        src="/static/common/3d.svg"
                        borderRadius="full"
                        alt="3d"
                        pos="relative"
                      />
                      <AbsoluteCenter _hover={{ opacity: 0.7 }}>
                        <Text
                          textAlign="center"
                          fontWeight="black"
                          fontSize="32px"
                          lineHeight="40px">
                          Stake <br /> NFT
                        </Text>
                      </AbsoluteCenter>
                    </Button>
                  ) : (
                    <Button
                      h="100%"
                      borderRadius="full"
                      bg="transparent"
                      _hover={{}}
                      cursor="unset"
                      _focus={{}}
                      pos="relative">
                      <Image
                        src="/static/common/3d-coming.svg"
                        borderRadius="full"
                        alt="3d"
                        pos="relative"
                      />
                      <AbsoluteCenter>
                        <Text
                          textAlign="center"
                          fontWeight="black"
                          fontSize="40px"
                          lineHeight="40px">
                          BID <br /> plot
                        </Text>
                      </AbsoluteCenter>
                    </Button>
                  )}
                </>
              )}
            </AbsoluteCenter>
          </Flex>
        </Box>
        <Image
          position="absolute"
          top={0}
          right="42px"
          objectFit="cover"
          w="504px"
          h="511px"
          src="/static/common/cartoon-1.svg"
          alt="cartoon-1"
        />
        <Image
          position="absolute"
          top="142px"
          right="244px"
          objectFit="cover"
          src="/static/common/cartoon-2.svg"
          w="300px"
          h="379px"
          alt="cartoon-2"
        />
      </Box>

      <Box h="1px" backgroundColor="rgba(112, 75, 234, 0.5)"></Box>
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
        <List />
      </Suspense>
      <Suspense>
        <BidderModal
          isOpen={open}
          onClose={onClose}
          status={auctionInfo.status}
        />
      </Suspense>
    </Box>
  )
}
