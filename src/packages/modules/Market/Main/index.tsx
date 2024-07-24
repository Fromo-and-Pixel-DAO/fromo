'use client'

import { Suspense, lazy, useEffect, useState } from 'react'

import {
  AbsoluteCenter,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  SimpleGrid,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react'
// import { sleep } from '@utils'

import NFTAuctions from '@components/NFTAuctions'
import { faker } from '@faker-js/faker'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { toastError, toastWarning } from '@utils/toast'
import { ethers } from 'ethers'
import moment from 'moment'
import { useRouter } from 'next/router'
import FroopyABI from 'packages/abis/demo/BidFromo.json'
import { getStakeNotices, getSysBrief } from 'packages/service/api'
import { IGameInfo } from 'packages/service/api/types'
import useStore from 'packages/store'
import useAuctions, { ActivityStatus } from 'packages/store/auctions'
import useFomoStore from 'packages/store/fomo'
import { web3Modal } from 'packages/web3'
import { useAccount } from 'wagmi'
import { useWindowSize } from '@hooks/useWindowSize'
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

const FL_CONTRACT_ADR: string = process.env
  .NEXT_PUBLIC_FL_CONTRACT_ADR as string

export default function Main() {
  const router = useRouter()
  const account = useAccount()
  const { address } = useStore()
  const { openConnectModal } = useConnectModal()
  const { width } = useWindowSize()

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

  const fetchSysBrief = async () => {
    const data = await getSysBrief()
    setSysInfo(data)
  }

  const getLocalStakeStatus = async () => {
    if (address && window.localStorage.getItem('staked')) {
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()
      const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
      const bidInfo = await contract.bidRoundInfo()
      const staked = JSON.parse(window.localStorage.getItem('staked'))
      console.log(Number(staked[1]))
      if (staked[0] === '1' && Number(staked[1]) < Number(bidInfo.lastBidId)) {
        window.localStorage.removeItem('staked')
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAuctionInfo()
        await getNftAuctions()
        await fetchSysBrief()
        await getLocalStakeStatus()
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
      title: 'Total Minted Keys',
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

  const toolTip = () => {
    return (
      <Tooltip
        label={
          ActivityStatus.Staking === auctionInfo.status ? (
            <>
              {' '}
              {address && auctionInfo.bidWinnerAddress === address ? (
                <>
                  {' '}
                  You won the FROMO plot and the chance to auction NFT on{' '}
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
              {moment.utc(auctionInfo.startTimestamp).format('MMMM DD, ha')} UTC
              by bidding a plot of FroopyLand
            </>
          )
        }>
        <Image
          src="/static/common/help.svg"
          w={{ md: '16px', xl: '28px' }}
          h={{ md: '16px', xl: '28px' }}
          alt="help"
        />
      </Tooltip>
    )
  }

  return (
    <Box alignItems="center" mb="50px">
      <Box
        pt={{ base: '170px', md: '60px' }}
        px={{ base: '20px', lg: '32px', xl: '48px' }}
        position="relative">
        <Box>
          <Box
            pl={{ xl: '40px' }}
            mb={{ base: '80px', md: '40px', xl: '126px' }}>
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

            <Box display={{ base: 'block', md: 'none' }} mb="40px">
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
              <Flex display={{ base: 'none', md: 'flex' }}>
                {OMO_Metrics.map((i, k) => (
                  <Flex key={k} ml={{ base: k === 0 ? '' : '28px' }}>
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
                <Box
                  w={{ base: width > 424 ? '112px' : '98px' }}
                  pos="absolute"
                  left="0px"
                  top="50%"
                  transform="translateY(-50%)">
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
                          w={{
                            base: width > 424 ? '112px' : '98px',
                          }}
                          bg="black"
                          src={
                            auctionInfo.status === ActivityStatus.Bidding
                              ? '/static/common/3d.svg'
                              : '/static/common/3d-coming.svg'
                          }
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
                        {address &&
                        auctionInfo.bidWinnerAddress.toLowerCase() ===
                          address &&
                        ((window.localStorage.getItem('staked') &&
                          JSON.parse(
                            window.localStorage.getItem('staked'),
                          )[0] !== '1') ||
                          !window.localStorage.getItem('staked')) ? (
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
                              bg="black"
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
                              bg="black"
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
                  ml="80px"
                  w="100%"
                  bg="#7E4AF1"
                  borderRadius="12px"
                  py="12px"
                  pl={{ base: '40px', sm: '52px' }}
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
                    <Flex whiteSpace="nowrap" fontSize="14px">
                      Highest Bid :
                      <Box mx="4px">
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
                    <Box
                      textTransform="uppercase"
                      whiteSpace="nowrap"
                      fontSize="14px">
                      {[
                        ActivityStatus.NotStarted,
                        ActivityStatus.Bidding,
                      ].includes(auctionInfo.status) && (
                        <>
                          {auctionInfo.status === ActivityStatus.NotStarted &&
                            `Open on ${moment
                              .utc(auctionInfo.startTimestamp)
                              .format('MMMM DD, Ha')} UTC `}
                          {auctionInfo.status === ActivityStatus.Bidding &&
                            `Close on ${moment
                              .utc(auctionInfo.startTimestamp)
                              .add(16, 'hours')
                              .format('MMMM DD, Ha')} UTC `}
                        </>
                      )}

                      {auctionInfo.status === ActivityStatus.Staking &&
                        `Close on
                    ${moment
                      .utc(auctionInfo.startTimestamp)
                      .add(8, 'hours')
                      .format('MMMM DD, ha')} UTC `}
                    </Box>
                  </Flex>
                </Flex>
              </Flex>
            </Box>
          </Box>
          {/* laptop */}
          <Box>
            <Flex
              display={{ base: 'none', md: 'flex' }}
              pos="relative"
              bg="#7E4AF1"
              py="28px"
              px="25px"
              h={{ md: '88px', xl: 'unset' }}
              fontSize="24px"
              lineHeight="28px"
              fontWeight="800"
              alignItems="center"
              borderRadius="full">
              <Flex
                gap={{
                  md: '8px',
                  lg: '12px',
                  xl: width > 1440 ? '28px' : '10px',
                }}
                direction={{
                  md: 'column',
                  lg: width > 1100 ? 'row' : 'column',
                }}
                w="50%">
                <Box display={{ md: 'none', xl: 'block' }}>{toolTip()}</Box>
                <Flex
                  gap="4px"
                  fontSize={{
                    md: '16px',
                    xl: width > 1440 ? '24px' : '20px',
                  }}
                  whiteSpace="nowrap"
                  alignItems="center">
                  <Box display={{ md: 'block', xl: 'none' }}>{toolTip()}</Box>
                  <Text>Highest Bid</Text>
                  <Text>: </Text>
                  <Box mx={{ xl: '4px' }}>
                    {parseFloat(`${auctionInfo?.highestBid}`).toFixed(2) ||
                      '--'}
                  </Box>
                  <Text>$OMO</Text>
                </Flex>
                <Box
                  fontSize={{
                    md: '16px',
                    xl: width > 1440 ? '24px' : '20px',
                  }}>
                  {Number(auctionInfo.biddersCount) === 0
                    ? 0
                    : auctionInfo.biddersCount || '--'}{' '}
                  Bidders
                </Box>
              </Flex>

              <Box ml={{ md: '168px', xl: '0px' }} w="50%" alignItems="center">
                <Flex
                  gap={{ md: '8px', xl: '12px' }}
                  ml={{ xl: '110px' }}
                  alignItems="center">
                  <Image
                    src="/static/common/timer.svg"
                    w={{ md: '20px', xl: '28px' }}
                    h={{ md: '20px', xl: '28px' }}
                    alt="timer"
                  />
                  <Box
                    textTransform="uppercase"
                    whiteSpace="nowrap"
                    fontSize={{
                      md: '16px',
                      xl: width > 1440 ? '24px' : '20px',
                    }}>
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
              <AbsoluteCenter w={{ md: '170px', xl: '220px' }}>
                {/* NotStarted or Bidding */}
                {[ActivityStatus.NotStarted, ActivityStatus.Bidding].includes(
                  auctionInfo.status,
                ) && (
                  <Button
                    h="100%"
                    borderRadius="full"
                    bg="transparent"
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
                      src={
                        auctionInfo.status === ActivityStatus.Bidding
                          ? '/static/common/3d.svg'
                          : '/static/common/3d-coming.svg'
                      }
                      borderRadius="full"
                      alt="3d"
                      pos="relative"
                    />
                    <AbsoluteCenter _hover={{ opacity: 0.7 }}>
                      <Text
                        textAlign="center"
                        fontWeight="black"
                        fontSize={{ md: '24px', lg: '28px', xl: '40px' }}>
                        BID <br /> plot
                      </Text>
                    </AbsoluteCenter>
                  </Button>
                )}
                {/* Staking */}
                {ActivityStatus.Staking === auctionInfo.status && (
                  <>
                    {address &&
                    auctionInfo.bidWinnerAddress.toLowerCase() === address &&
                    ((window.localStorage.getItem('staked') &&
                      JSON.parse(window.localStorage.getItem('staked'))[0] !==
                        '1') ||
                      !window.localStorage.getItem('staked')) ? (
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
                            fontSize={{ md: '24px', lg: '28px', xl: '40px' }}>
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
                            fontSize={{ md: '24px', lg: '28px', xl: '40px' }}>
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
          right={{ xl: width > 1440 ? '42px' : '-12px' }}
          objectFit="cover"
          w={{ xl: width > 1440 ? '504px' : '420px' }}
          display={{ base: 'none', xl: 'block' }}
          h={{ xl: width > 1440 ? '504px' : '420px' }}
          src="/static/common/cartoon-1.svg"
          alt="cartoon-1"
        />
        <Image
          position="absolute"
          top={{ base: '-36px', sm: '-48px', md: '12px' }}
          right={{
            base: width > 424 ? '0px' : '0px',
            sm: '20px',
            md: '12px',
            lg: '80px',
          }}
          objectFit="cover"
          w={{
            base: width > 424 ? '300px' : '290px',
            sm: '332px',
            md: '300px',
            lg: '340px',
          }}
          display={{ base: 'block', xl: 'none' }}
          h="240px"
          src="/static/common/cartoon-mobile.svg"
          alt="cartoon"
          zIndex={100}
        />
        <Image
          display={{ base: 'none', xl: 'block' }}
          position="absolute"
          top={{ xl: width > 1440 ? '142px' : '120px' }}
          right={{ xl: width > 1440 ? '244px' : '140px' }}
          objectFit="contain"
          src="/static/common/cartoon-2.svg"
          w={{ xl: width > 1440 ? 'unset' : '280px' }}
          h={{ xl: width > 1440 ? 'unset' : '280px' }}
          alt="cartoon-2"
        />
      </Box>

      <NFTAuctions />
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
