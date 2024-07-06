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
  useBreakpointValue,
} from '@chakra-ui/react'
import ItemGrid from 'packages/ui/components/ListItems/ItemGrid'
// import { sleep } from '@utils'

import NoData from '@components/NoData'
import { faker } from '@faker-js/faker'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { toastError, toastWarning } from '@utils/toast'
import { ethers } from 'ethers'
import moment from 'moment'
import { useRouter } from 'next/router'
import { getStakeNotices, getSysBrief } from 'packages/service/api'
import { IGameInfo } from 'packages/service/api/types'
import useStore from 'packages/store'
import useAuctions, { ActivityStatus } from 'packages/store/auctions'
import useFomoStore from 'packages/store/fomo'
import { useAccount } from 'wagmi'
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
  const account = useAccount()
  const { address } = useStore()
  const { openConnectModal } = useConnectModal()

  const [open, setOpen] = useState(false)

  const { gameList, upcomingList, ongoingList, finishedList, getNftAuctions } =
    useFomoStore()

  const { auctionInfo, getAuctionInfo } = useAuctions()
  const [loading, setLoading] = useState(true)

  const [sysInfo, setSysInfo] = useState<IGameInfo>({
    tokenPrice: '-',
    totalKeyMinted: '-',
    totalMintFee: '-',
    totalPrize: '-',
    totalProfits: '-',
    totalGames: '-',
  })

  const textStroke =
    useBreakpointValue({
      base: '6px',
      xl: '10px',
    }) ?? '10px'

  const List = () => {
    if (gameList.length === 0) return <NoData />

    return (
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
    )
  }

  const fetchSysBrief = async () => {
    const data = await getSysBrief()
    setSysInfo(data)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAuctionInfo()
        await getNftAuctions()
        await fetchSysBrief()
        setLoading(false)
      } catch (error) {
        console.error('Error fetching auction info:', error)
      }
    }

    fetchData()
  }, [getAuctionInfo, getNftAuctions])

  const onClose = () => {
    getAuctionInfo()
    setOpen(false)
  }

  useEffect(() => {
    if (auctionInfo && address && !loading) {
      if (
        auctionInfo &&
        auctionInfo.status === ActivityStatus.Staking &&
        auctionInfo.bidWinnerAddress === address.toLocaleLowerCase()
      ) {
        toastWarning(
          'You won the FROMO plot, stake your NFT now and start your own gamified NFT auction.',
        )
      } else {
        getStakeNotices(address)
          .then((res) => {
            if (res > 0) {
              toastError(
                'You lost the $OMO you bid because you failed to stake NFT.',
              )
            }
          })
          .catch((err) => {
            console.log(err)
          })
      }
    }
  }, [auctionInfo, address, loading])

  if (!auctionInfo) return null
  const OMO_Metrics = [
    {
      title: '$OMO Price',
      data: parseFloat(sysInfo?.tokenPrice).toFixed(4) || '-',
    },
    {
      title: 'Total Minted Key',
      data: sysInfo?.totalKeyMinted !== '-' ? sysInfo?.totalKeyMinted : '-',
      // data2: sysInfo?.totalMintFee !== '-' ? sysInfo?.totalMintFee : '-',
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
      <Box
        pt={{ base: '204px', md: '60px' }}
        px={{ base: '20px', lg: '32px', xl: '48px' }}
        position="relative">
        <Box>
          <Box pl={{ xl: '40px' }} mb="126px">
            <Text className="stroked-text">
              <Flex
                className="stroked-text-gradient"
                fontWeight="800"
                ml="-6px"
                p="10px">
                <Flex
                  whiteSpace="nowrap"
                  fontSize={{ base: '40px', md: '32px', xl: '60px' }}
                  style={{
                    WebkitTextStrokeWidth: textStroke,
                  }}>
                  <Text display={{ base: 'none', md: 'block' }}>
                    Start Your NFT Auction :
                  </Text>
                  <Box display={{ base: 'block', md: 'none' }}>
                    <Text>Start Your NFT</Text>
                    <Text mt="-12px">Auction :</Text>
                  </Box>
                </Flex>
              </Flex>
            </Text>
            <Text
              fontSize={{ base: '28px', xl: '48px' }}
              fontWeight="extrabold"
              mt="-6px"
              mb={{ base: '36px', md: '40px' }}
              lineHeight={{ xl: '56px' }}>
              <Text display={{ base: 'block', xl: 'none' }}>
                {' '}
                Bid Fromo Plot to <br /> Start a Gamified NFT Auction{' '}
              </Text>
              <Text display={{ base: 'none', xl: 'block' }}>
                {' '}
                Bid Fromo Plot to <br /> Start a Gamified NFT Auction{' '}
              </Text>
            </Text>

            <Box display={{ base: 'block', xl: 'none' }} mb="40px">
              <SimpleGrid columns={2} spacing={5}>
                {OMO_Metrics.map((i, k) => (
                  <Flex key={k} ml={{ xl: k === 0 ? '' : '28px' }}>
                    <Box>
                      <Text
                        fontSize={{ base: '12px', xl: '16px' }}
                        lineHeight="20px"
                        color={{
                          base: 'rgba(255,255,255,0.6)',
                          md: 'white',
                        }}
                        fontWeight="semibold">
                        {i.title}
                      </Text>
                      <Flex alignItems="center">
                        {i.icon}
                        <Flex
                          fontWeight="extrabold"
                          fontSize={{ base: '28px', xl: '32px' }}
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
                  </Flex>
                ))}
              </SimpleGrid>
            </Box>

            {sysInfo && (
              <Flex display={{ base: 'none', xl: 'flex' }}>
                {OMO_Metrics.map((i, k) => (
                  <Flex key={k} ml={{ xl: k === 0 ? '' : '28px' }}>
                    <Box>
                      <Text
                        fontSize={{ base: '14px', xl: '16px' }}
                        lineHeight="20px"
                        mb="8px"
                        fontWeight="semibold">
                        {i.title}
                      </Text>
                      <Flex alignItems="center">
                        {i.icon}
                        <Flex
                          fontWeight="extrabold"
                          fontSize={{ base: '24px', xl: '32px' }}
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

            {/* mobile */}
            <Box
              display={{ md: 'none' }}
              pos="fixed"
              bottom="32px"
              left="12px"
              right="20px"
              zIndex={100}>
              <Flex
                w={{ md: 'fit-content' }}
                gap="16px"
                pos="relative"
                justifyContent="end"
                display={{ base: 'flex', xl: 'none' }}>
                <Box w="30%" pos="absolute" left="0px" bottom="-48px">
                  <Box pos="relative">
                    {/* NotStarted or Bidding */}
                    {[
                      ActivityStatus.NotStarted,
                      ActivityStatus.Bidding,
                    ].includes(auctionInfo.status) && (
                        <Button
                          px="0px"
                          h="100%"
                          borderRadius="full"
                          bg="transparent"
                          cursor={
                            ActivityStatus.NotStarted === auctionInfo.status
                              ? 'not-allowed'
                              : 'pointer'
                          }
                          _hover={{}}
                          _focus={{}}
                          onClick={() => {
                            if (!account.isConnected) {
                              if (openConnectModal) {
                                openConnectModal()
                              } else {
                                console.error('openConnectModal is not defined')
                              }
                            } else {
                              if (
                                ActivityStatus.NotStarted !== auctionInfo.status
                              ) {
                                setOpen(true)
                              }
                            }
                          }}
                          pos="relative">
                          <Image
                            w="112px"
                            h="fit-content"
                            src="/static/common/3d.svg"
                            borderRadius="full"
                            alt="3d"
                            pos="relative"
                          />
                          <AbsoluteCenter _hover={{ opacity: 0.7 }}>
                            <Text textAlign="center" fontWeight="black">
                              BID <br /> plot
                            </Text>
                          </AbsoluteCenter>
                        </Button>
                      )}
                    {/* Staking */}
                    {ActivityStatus.Staking === auctionInfo.status && (
                      <>
                        {address && auctionInfo.bidWinnerAddress === address ? (
                          <Button
                            px="0px"
                            h="100%"
                            borderRadius="full"
                            bg="transparent"
                            cursor="pointer"
                            _hover={{}}
                            _focus={{}}
                            onClick={() => router.push('/stake-nft')}
                            pos="relative">
                            <Image
                              src="/static/common/3d-stake.svg"
                              borderRadius="full"
                              w="112px"
                              h="fit-content"
                              alt="3d"
                              pos="relative"
                            />
                            <AbsoluteCenter _hover={{ opacity: 0.7 }}>
                              <Text textAlign="center" fontWeight="black">
                                Stake <br /> NFT
                              </Text>
                            </AbsoluteCenter>
                          </Button>
                        ) : (
                          <Button
                            px="0px"
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
                              w="112px"
                              h="fit-content"
                              pos="relative"
                            />
                            <AbsoluteCenter>
                              <Text textAlign="center" fontWeight="black">
                                BID <br /> plot
                              </Text>
                            </AbsoluteCenter>
                          </Button>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
                <Flex
                  w="77%"
                  bg="#7E4AF1"
                  borderRadius="12px"
                  py="12px"
                  pl="36px"
                  pr="20px"
                  fontSize="14px"
                  fontWeight="800"
                  direction="column"
                  gap="8px"
                  justifyContent="space-between">
                  <Box lineHeight="16px">
                    {Number(auctionInfo.biddersCount) === 0
                      ? 0
                      : auctionInfo.biddersCount || '--'}{' '}
                    Bidders
                  </Box>
                  <Flex alignItems="center" lineHeight="16px" gap="6px">
                    <Tooltip
                      label={
                        ActivityStatus.Staking === auctionInfo.status ? (
                          <>
                            {' '}
                            {address &&
                              auctionInfo.bidWinnerAddress === address ? (
                              <>
                                {' '}
                                You won the FROMO plot and the chance to auction
                                NFT on{' '}
                                {moment
                                  .utc(auctionInfo.startTimestamp)
                                  .format('MMMM DD, ha')}{' '}
                                UTC{' '}
                              </>
                            ) : (
                              <>
                                {' '}
                                The NFT auction will start on{' '}
                                {moment
                                  .utc(auctionInfo.startTimestamp)
                                  .add(8, 'hours')
                                  .format('MMMM DD, ha')}{' '}
                                UTC{' '}
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {' '}
                            Get the chance to auction NFT on{' '}
                            {moment
                              .utc(auctionInfo.startTimestamp)
                              .format('MMMM DD, ha')}{' '}
                            UTC by bidding a plot of FroopyLand
                          </>
                        )
                      }>
                      <Image
                        src="/static/common/help.svg"
                        w="16px"
                        h="16px"
                        alt="help"
                      />
                    </Tooltip>
                    <Flex>
                      <Text>Highest Bid</Text>
                      <Text>: </Text>
                      <Box ml="4px">
                        {parseFloat(`${auctionInfo?.highestBid}`).toFixed(2) ||
                          '--'}
                      </Box>
                      <Text>$OMO</Text>
                    </Flex>
                  </Flex>

                  <Flex alignItems="center" lineHeight="16px" gap="6px">
                    <Image
                      src="/static/common/timer.svg"
                      w="16px"
                      h="16px"
                      alt="timer"
                    />
                    <Box textTransform="uppercase">
                      {[
                        ActivityStatus.NotStarted,
                        ActivityStatus.Bidding,
                      ].includes(auctionInfo.status) && (
                          <>
                            {auctionInfo.status === ActivityStatus.NotStarted &&
                              `Open on ${moment
                                .utc(auctionInfo.startTimestamp)
                                .format('MMMM DD, Ha')}`}
                            {auctionInfo.status === ActivityStatus.Bidding &&
                              `Close on ${moment
                                .utc(auctionInfo.startTimestamp)
                                .add(16, 'hours')
                                .format('MMMM DD, Ha')}`}
                          </>
                        )}

                      {auctionInfo.status === ActivityStatus.Staking &&
                        ` Close on
                    ${moment
                          .utc(auctionInfo.startTimestamp)
                          .add(8, 'hours')
                          .format('MMMM DD, ha')}`}
                    </Box>
                  </Flex>
                </Flex>
              </Flex>
            </Box>
            {/* table */}
            <Flex
              w={{ md: 'fit-content' }}
              bg="#7E4AF1"
              borderRadius="8px"
              py="16px"
              px="16px"
              gap="16px"
              display={{ base: 'none', md: 'flex', xl: 'none' }}>
              <Box pos="relative">
                {/* NotStarted or Bidding */}
                {[ActivityStatus.NotStarted, ActivityStatus.Bidding].includes(
                  auctionInfo.status,
                ) && (
                    <Button
                      px="0px"
                      h="100%"
                      borderRadius="full"
                      bg="transparent"
                      cursor={
                        ActivityStatus.NotStarted === auctionInfo.status
                          ? 'not-allowed'
                          : 'pointer'
                      }
                      _hover={{}}
                      _focus={{}}
                      onClick={() => {
                        if (!account.isConnected) {
                          if (openConnectModal) {
                            openConnectModal()
                          } else {
                            console.error('openConnectModal is not defined')
                          }
                        } else {
                          if (ActivityStatus.NotStarted !== auctionInfo.status) {
                            setOpen(true)
                          }
                        }
                      }}
                      pos="relative">
                      <Image
                        w="120px"
                        h="120px"
                        src="/static/common/3d.svg"
                        borderRadius="full"
                        alt="3d"
                        pos="relative"
                      />
                      <AbsoluteCenter _hover={{ opacity: 0.7 }}>
                        <Text textAlign="center" fontWeight="black">
                          BID <br /> plot
                        </Text>
                      </AbsoluteCenter>
                    </Button>
                  )}
                {/* Staking */}
                {ActivityStatus.Staking === auctionInfo.status && (
                  <>
                    {address && auctionInfo.bidWinnerAddress === address ? (
                      <Button
                        px="0px"
                        h="100%"
                        borderRadius="full"
                        bg="transparent"
                        cursor="pointer"
                        _hover={{}}
                        _focus={{}}
                        onClick={() => router.push('/stake-nft')}
                        pos="relative">
                        <Image
                          src="/static/common/3d-stake.svg"
                          borderRadius="full"
                          w="120px"
                          h="120px"
                          alt="3d"
                          pos="relative"
                        />
                        <AbsoluteCenter _hover={{ opacity: 0.7 }}>
                          <Text textAlign="center" fontWeight="black">
                            Stake <br /> NFT
                          </Text>
                        </AbsoluteCenter>
                      </Button>
                    ) : (
                      <Button
                        px="0px"
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
                          w="120px"
                          h="120px"
                          pos="relative"
                        />
                        <AbsoluteCenter>
                          <Text textAlign="center" fontWeight="black">
                            BID <br /> plot
                          </Text>
                        </AbsoluteCenter>
                      </Button>
                    )}
                  </>
                )}
              </Box>
              <Flex
                fontSize="14px"
                fontWeight="800"
                direction="column"
                justifyContent="space-between">
                <Flex alignItems="center" gap="6px">
                  <Tooltip
                    label={
                      ActivityStatus.Staking === auctionInfo.status ? (
                        <>
                          {' '}
                          {address &&
                            auctionInfo.bidWinnerAddress === address ? (
                            <>
                              {' '}
                              You won the FROMO plot and the chance to auction
                              NFT on{' '}
                              {moment
                                .utc(auctionInfo.startTimestamp)
                                .format('MMMM DD, ha')}{' '}
                              UTC{' '}
                            </>
                          ) : (
                            <>
                              {' '}
                              The NFT auction will start on{' '}
                              {moment
                                .utc(auctionInfo.startTimestamp)
                                .add(8, 'hours')
                                .format('MMMM DD, ha')}{' '}
                              UTC{' '}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {' '}
                          Get the chance to auction NFT on{' '}
                          {moment
                            .utc(auctionInfo.startTimestamp)
                            .format('MMMM DD, ha')}{' '}
                          UTC by bidding a plot of FroopyLand
                        </>
                      )
                    }>
                    <Image
                      src="/static/common/help.svg"
                      w={{ base: '20px', xl: '28px' }}
                      h={{ base: '20px', xl: '28px' }}
                      alt="help"
                    />
                  </Tooltip>
                  <Flex>
                    <Text>Highest Bid</Text>
                    <Text>: </Text>
                    <Box ml="4px">
                      {parseFloat(`${auctionInfo?.highestBid}`).toFixed(2) ||
                        '--'}
                    </Box>
                    <Text>$OMO</Text>
                  </Flex>
                </Flex>
                <Box>
                  {Number(auctionInfo.biddersCount) === 0
                    ? 0
                    : auctionInfo.biddersCount || '--'}{' '}
                  Bidders
                </Box>
                <Flex alignItems="center" gap="6px">
                  <Image
                    src="/static/common/timer.svg"
                    w={{ base: '20px', xl: '28px' }}
                    h={{ base: '20px', xl: '28px' }}
                    alt="timer"
                  />
                  <Box textTransform="uppercase">
                    {[
                      ActivityStatus.NotStarted,
                      ActivityStatus.Bidding,
                    ].includes(auctionInfo.status) && (
                        <>
                          {auctionInfo.status === ActivityStatus.NotStarted &&
                            `Open on ${moment
                              .utc(auctionInfo.startTimestamp)
                              .format('MMMM DD, Ha')}`}
                          {auctionInfo.status === ActivityStatus.Bidding &&
                            `Close on ${moment
                              .utc(auctionInfo.startTimestamp)
                              .add(16, 'hours')
                              .format('MMMM DD, Ha')}`}
                        </>
                      )}

                    {auctionInfo.status === ActivityStatus.Staking &&
                      ` Close on
                    ${moment
                        .utc(auctionInfo.startTimestamp)
                        .add(8, 'hours')
                        .format('MMMM DD, ha')}`}
                  </Box>
                </Flex>
              </Flex>
            </Flex>
          </Box>
          {/* laptop */}
          <Box>
            <Flex
              display={{ base: 'none', xl: 'flex' }}
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
                        {address && auctionInfo.bidWinnerAddress === address ? (
                          <>
                            {' '}
                            You won the FROMO plot and the chance to auction NFT
                            on{' '}
                            {moment
                              .utc(auctionInfo.startTimestamp)
                              .format('MMMM DD, ha')}{' '}
                            UTC{' '}
                          </>
                        ) : (
                          <>
                            {' '}
                            The NFT auction will start on{' '}
                            {moment
                              .utc(auctionInfo.startTimestamp)
                              .add(8, 'hours')
                              .format('MMMM DD, ha')}{' '}
                            UTC{' '}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {' '}
                        Get the chance to auction NFT on{' '}
                        {moment
                          .utc(auctionInfo.startTimestamp)
                          .format('MMMM DD, ha')}{' '}
                        UTC by bidding a plot of FroopyLand
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
                    {parseFloat(`${auctionInfo?.highestBid}`).toFixed(2) ||
                      '--'}
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
                  <Box textTransform="uppercase">
                    {[
                      ActivityStatus.NotStarted,
                      ActivityStatus.Bidding,
                    ].includes(auctionInfo.status) && (
                        <>
                          {auctionInfo.status === ActivityStatus.NotStarted &&
                            `Open on ${moment
                              .utc(auctionInfo.startTimestamp)
                              .format('MMMM DD, Ha')}`}
                          {auctionInfo.status === ActivityStatus.Bidding &&
                            `Close on ${moment
                              .utc(auctionInfo.startTimestamp)
                              .add(16, 'hours')
                              .format('MMMM DD, Ha')}`}
                        </>
                      )}
                    {auctionInfo.status === ActivityStatus.Staking &&
                      ` Close on
                    ${moment
                        .utc(auctionInfo.startTimestamp)
                        .add(8, 'hours')
                        .format('MMMM DD, ha')}`}{' '}
                    UTC{' '}
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
                      cursor={
                        ActivityStatus.NotStarted === auctionInfo.status
                          ? 'not-allowed'
                          : 'pointer'
                      }
                      _hover={{}}
                      _focus={{}}
                      onClick={() => {
                        if (!account.isConnected) {
                          if (openConnectModal) {
                            openConnectModal()
                          } else {
                            console.error('openConnectModal is not defined')
                          }
                        } else {
                          if (ActivityStatus.NotStarted !== auctionInfo.status) {
                            setOpen(true)
                          }
                        }
                      }}
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
                    {address && auctionInfo.bidWinnerAddress === address ? (
                      <Button
                        h="100%"
                        borderRadius="full"
                        bg="transparent"
                        cursor="pointer"
                        _hover={{}}
                        _focus={{}}
                        onClick={() => router.push('/stake-nft')}
                        pos="relative">
                        <Image
                          src="/static/common/3d-stake.svg"
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
        </Box>
        <Image
          position="absolute"
          top={0}
          right="42px"
          objectFit="cover"
          w="504px"
          display={{ base: 'none', xl: 'block' }}
          h="511px"
          src="/static/common/cartoon-1.svg"
          alt="cartoon-1"
        />
        <Image
          position="absolute"
          top={{ base: '0px', md: '12px' }}
          right={{ base: '0px', md: '12px' }}
          objectFit="cover"
          w="290px"
          display={{ base: 'block', xl: 'none' }}
          h="240px"
          src="/static/common/cartoon-mobile.png"
          alt="cartoon"
        />
        <Image
          display={{ base: 'none', xl: 'block' }}
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
