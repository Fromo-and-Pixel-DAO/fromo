import { lazy, useEffect, useState } from 'react'

import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react'

import TabsCommon from '@components/TabsCommon'

import { MarketTabs, MyDividendsTabs } from '@ts'
import { toastError, toastSuccess } from '@utils/toast'
import { ethers } from 'ethers'
import {
  getHistoricalDividendsAndPrize,
  getMyPurchasedNfts,
} from 'packages/service/api'
import {
  IProfit,
  IUserDividends,
  IUserRetrieved,
} from 'packages/service/api/types'
import useStore from 'packages/store'
import useFomoStore from 'packages/store/fomo'
import {
  checkApprovalFunc,
  claimBonusFunc,
  convertKeyToToken,
  withdrawLastplayerPrizeFunc,
  withdrawSaleRevenueFunc,
} from 'packages/web3'

const ListItems = lazy(() => import('@modules/Profile/ListItems'))
const Sidebar = lazy(() => import('@modules/Profile/Sidebar'))
const Header = lazy(() => import('@modules/Profile/Header'))
const RedeemModal = lazy(() => import('@modules/Profile/RedeemModal'))
const OmoModal = lazy(() => import('@modules/Profile/OmoModal'))

export default function Main() {
  const { userHeaderInfo, getUserHeaderInfo } = useFomoStore()
  const [claimKeysLoading, setClaimKeysLoading] = useState(false)
  const [claimFinalWinnerLoading, setClaimFinalWinnerLoading] = useState(false)
  const [claimNftLoading, setClaimNftLoading] = useState(false)
  const [convertKeysLoading, setConvertKeysLoading] = useState(false)

  const handleHistoricalPageChange = (page: number) => {
    setCurrentHistoricalPage(page)
  }

  const handleNFTPageChange = (page: number) => {
    setCurrentNFTPage(page)
  }

  const handleHistoricalTabChange = (tab: MyDividendsTabs) => {
    if (tab === MyDividendsTabs.UNCLAIMED) {
      setHistoricalTab(0)
    } else {
      setHistoricalTab(1)
    }
  }

  const handleOpenOmo = (type: number) => {
    if (type === 1) {
      checkApprovalFunc().then((res) => {
        if (res) {
          setIsApproval(true)
        } else {
          setIsApproval(false)
        }
        setOmoType(type)
        setOpenOmo(true)
      })
    } else {
      setOmoType(type)
      setOpenOmo(true)
    }
  }

  const handleClaim = (type: number) => {
    // claim key dividends
    if (type === 0) {
      setClaimKeysLoading(true)
      claimBonusFunc(profit.unclaimedKeyGameIds)
        .then((res) => {
          if (res) {
            toastSuccess(
              'You have successfully claimed dividends or prize.',
              2000,
            )
          }
        })
        .catch((err) => {
          console.log(err)
          toastError(
            'You failed to claim dividends or prize due to some error.',
            2000,
          )
        })
        .finally(() => {
          setClaimKeysLoading(false)
        })
    }
    // claim final winner prize
    else if (type === 1) {
      setClaimFinalWinnerLoading(true)
      withdrawLastplayerPrizeFunc(profit.unclaimedFinalWinnerGameIds)
        .then((res) => {
          if (res) {
            toastSuccess(
              'You have successfully claimed dividends or prize.',
              2000,
            )
          }
        })
        .catch((err) => {
          console.log(err)
          toastError(
            'You failed to claim dividends or prize due to some error.',
            2000,
          )
        })
        .finally(() => {
          setClaimFinalWinnerLoading(false)
        })
    }
    // claim nft dividends
    else if (type === 2) {
      setClaimNftLoading(true)
      withdrawSaleRevenueFunc(profit.unclaimedNftGameIds)
        .then((res) => {
          if (res) {
            toastSuccess(
              'You have successfully claimed dividends or prize.',
              2000,
            )
          }
        })
        .catch((err) => {
          console.log(err)
          toastError(
            'You failed to claim dividends or prize due to some error.',
            2000,
          )
        })
        .finally(() => {
          setClaimNftLoading(false)
        })
    }
  }

  const redeemKeys = () => {
    setConvertKeysLoading(true)
    convertKeyToToken(profit.unconvertedGameIds)
      .then((res) => {
        if (res) {
          toastSuccess('You have successfully redeemed your Keys.', 2000)
        } else {
          toastError('You failed to redeem your Keys due to some error.', 2000)
        }
      })
      .catch((err) => {
        console.log(err)
        toastError('You failed to redeem your Keys due to some error.', 2000)
      })
      .finally(() => {
        setConvertKeysLoading(false)
      })
  }

  const { address } = useStore()

  const [open, setOpen] = useState(false)
  const [oepnOmo, setOpenOmo] = useState(false)
  const [omoType, setOmoType] = useState<number>(0)
  const [isApproval, setIsApproval] = useState<boolean>(false)
  const [historicalTab, setHistoricalTab] = useState<number>(0)
  const [currentHistoricalPage, setCurrentHistoricalPage] = useState(0)
  const [currentNFTPage, setCurrentNFTPage] = useState(0)
  const [profit, setProfit] = useState<IProfit>({
    flPrice: '-',
    keys: '-',
    lockedKeys: '-',
    flTokens: '-',
    lockedFlTokens: '-',
    withdrawalAmountTokens: '-',
    keyDividends: '-',
    convertedGameIds: [],
    unconvertedGameIds: [],
    canConvert: 0,
    unclaimedKeyDividends: '-',
    unclaimedKeyGameIds: [],
    finalWinPrice: '-',
    unclaimedFinalWinPrice: '-',
    unclaimedFinalWinnerGameIds: [],
    nftDividends: '-',
    lockedNftDividends: '-',
    unclaimedNftDividends: '-',
    unclaimedNftGameIds: [],
  })

  const [historicalDividends, setHistoricalDividends] =
    useState<IUserDividends>({
      total: 0,
      historicalDividendsList: [],
    })

  const [purchasedNfts, setPurchasedNfts] = useState<IUserRetrieved>({
    total: 0,
    gameNftList: [],
  })

  const renderDividends = [
    {
      id: 0,
      title: 'Unclaimed',
      value: MyDividendsTabs.UNCLAIMED,
      render: (
        <ListItems
          haveGridMode={false}
          columnsGrid={[1, 2, 3, 4, 5]}
          isLoading={false}
          isCustom={false}
          total={historicalDividends ? historicalDividends.total : 0}
          currentPage={currentHistoricalPage}
          setCurrentPage={handleHistoricalPageChange}
          items={
            historicalDividends
              ? historicalDividends.historicalDividendsList
              : []
          }
          columnsList={[
            `${historicalDividends ? historicalDividends.total : 0} in Total`,
            'Type',
            'Amount',
            'Status',
            'Transaction',
            'Detail',
          ]}
        />
      ),
    },
    {
      id: 1,
      title: 'Claimed',
      value: MyDividendsTabs.CLAIMED,
      render: (
        <ListItems
          haveGridMode={false}
          columnsGrid={[1, 2, 3, 4, 5, 6]}
          isLoading={false}
          isCustom={false}
          total={historicalDividends ? historicalDividends.total : 0}
          currentPage={currentHistoricalPage}
          setCurrentPage={handleHistoricalPageChange}
          items={
            historicalDividends
              ? historicalDividends.historicalDividendsList
              : []
          }
          columnsList={[
            `${historicalDividends ? historicalDividends.total : 0} in Total`,
            'Type',
            'Amount',
            'Status',
            'Transaction',
            'Detail',
          ]}
        />
      ),
    },
  ]

  const renderNFTS = [
    {
      id: 0,
      title: 'Public pool',
      value: MarketTabs.PUBLIC,
      render: (
        <ListItems
          haveGridMode={false}
          columnsGrid={[1, 2, 2, 2]}
          isLoading={false}
          items={purchasedNfts ? purchasedNfts.gameNftList : []}
          currentPage={currentNFTPage}
          setCurrentPage={handleNFTPageChange}
          isCustom
          columnsList={[
            `${purchasedNfts ? purchasedNfts.total : 0} Total `,
            'NFT ID',
            'Transaction',
            'Detail',
          ]}
        />
      ),
    },
  ]

  // header info
  const refreshUserHeaderInfo = () => {
    getUserHeaderInfo(address).then((res) => {
      if (res) {
        setProfit(res)
      }
    })
  }

  // profit
  useEffect(() => {
    getUserHeaderInfo(address).then((res) => {
      if (res) {
        setProfit(res)
      }
    })
  }, [address, getUserHeaderInfo])

  // historical dividends
  useEffect(() => {
    getHistoricalDividendsAndPrize(
      address,
      currentHistoricalPage,
      historicalTab,
    )
      .then((res) => {
        if (res) {
          setHistoricalDividends(res)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }, [address, currentHistoricalPage, historicalTab])

  // my nfts
  useEffect(() => {
    getMyPurchasedNfts(address, currentNFTPage)
      .then((res) => {
        if (res) {
          setPurchasedNfts(res)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }, [address, currentNFTPage])

  return (
    <Flex>
      <Sidebar />
      <Box flex="1" minW={{ base: 'full', md: '500px' }}>
        <Header headers={userHeaderInfo} />
        <Box m="0 216px" pb="72px">
          <Text
            fontSize="20px"
            lineHeight="24px"
            fontWeight={800}
            color="#fff"
            mt="24px"
            mb="24px">
            My Assets
          </Text>
          {/* My Assets */}
          <Flex gap="30px">
            <Box
              flex={1}
              p="28px 30px"
              border="1px solid #704BEA"
              bgColor="rgba(118, 74, 242, 0.5)"
              borderRadius="20px">
              <Text fontSize="16px" color="#FFA8FE" lineHeight="24px">
                My Keys
              </Text>
              <Flex alignItems="baseline" justifyContent="space-between">
                <Flex alignItems="center">
                  <Text
                    color="#00DAB3"
                    lineHeight="54px"
                    fontSize="36px"
                    fontWeight="900"
                    mr="10px">
                    {profit.keys}
                  </Text>
                  <Text fontSize="16px" lineHeight="24px">
                    KEYS
                  </Text>
                </Flex>
                <Flex>1.23 Key=1$OMO</Flex>
              </Flex>
              <Text mt="8px">
                Locked for participating NFT auctions: {profit.lockedKeys} Keys
              </Text>
              <Button
                disabled={
                  profit.keys === '0' ||
                  profit.keys === '-' ||
                  profit.canConvert === 0
                }
                isLoading={convertKeysLoading}
                mt="8px"
                bgColor="#00DAB3"
                w="100%"
                height="52px"
                color="#000"
                fontSize="20px"
                lineHeight="30px"
                onClick={redeemKeys}>
                Redeem
              </Button>
            </Box>
            <Box
              flex={1}
              p="28px 30px"
              border="1px solid #704BEA"
              bgColor="rgba(118, 74, 242, 0.5)"
              borderRadius="20px">
              <Flex justify="space-between" align="center">
                <Text fontSize="16px" color="#FFA8FE" lineHeight="24px">
                  My $OMO
                </Text>
                <Flex align="center">
                  Swap $OMO{' '}
                  <Image
                    src="/static/profile/share.svg"
                    ml="10px"
                    alt="share"
                    w="20px"
                    h="20px"></Image>
                </Flex>
              </Flex>
              <Flex alignItems="baseline">
                <Text
                  color="#00DAB3"
                  lineHeight="54px"
                  fontSize="36px"
                  fontWeight="900"
                  mr="10px">
                  {profit.flTokens && profit.flTokens !== '-'
                    ? Number(ethers.utils.formatEther(profit.flTokens)).toFixed(
                        4,
                      )
                    : '-'}
                </Text>
                <Text fontSize="16px" lineHeight="24px">
                  $OMO
                </Text>
              </Flex>
              <Text mt="8px">
                Locked for bidding FROMO plot:{' '}
                {profit.lockedFlTokens !== '-'
                  ? Number(
                      ethers.utils.formatEther(profit.lockedFlTokens),
                    ).toFixed(4)
                  : '-'}{' '}
                $OMO
              </Text>
              <Flex mt="8px" gap="12px">
                <Button
                  disabled={profit.flTokens === '0' || profit.flTokens === '-'}
                  onClick={() => handleOpenOmo(0)}
                  border="1px solid #FCFBFF"
                  bg="transparent"
                  w="100%"
                  height="52px"
                  color="#FFFFFF"
                  _hover={{ color: '#000000', bg: '#00DAB3' }}
                  fontSize="20px"
                  lineHeight="30px"
                  textShadow="0px 0px 30px 0px #390885;">
                  Withdraw
                </Button>
                <Button
                  onClick={() => handleOpenOmo(1)}
                  bgColor="#00DAB3"
                  w="100%"
                  height="52px"
                  color="#000"
                  fontSize="20px"
                  lineHeight="30px">
                  Deposit
                </Button>
              </Flex>
            </Box>
          </Flex>

          <Text
            fontSize="20px"
            lineHeight="24px"
            fontWeight={800}
            color="#fff"
            mt="40px"
            mb="24px">
            My Profit
          </Text>
          {/* My Profit */}
          <Flex
            mt="30px"
            justify="space-between"
            p="28px 30px"
            border="1px solid #704BEA"
            bgColor="rgba(118, 74, 242, 0.5)"
            borderRadius="20px">
            {/* Key Holder Dividends */}
            <Box flexBasis="33.33%" pr="30px">
              <Text fontSize="16px" color="#FFA8FE" lineHeight="24px">
                My Historical Key Holder Dividends
              </Text>
              <Flex alignItems="baseline" mb="36px">
                <Text
                  color="#00DAB3"
                  lineHeight="54px"
                  fontSize="36px"
                  fontWeight="900"
                  mr="10px">
                  {profit.keyDividends !== '-'
                    ? (
                        Number(profit.keyDividends) +
                        Number(profit.unclaimedKeyDividends)
                      ).toFixed(4)
                    : '-'}
                </Text>
                <Text fontSize="16px" lineHeight="24px">
                  ETH
                </Text>
              </Flex>
              <Text
                fontWeight={400}
                fontSize="12px"
                lineHeight="18px"
                color="rgba(255, 255, 255, 0.8)">
                Unclaimed:&nbsp;&nbsp;&nbsp;&nbsp;
                {profit.unclaimedKeyDividends !== '-'
                  ? profit.unclaimedKeyDividends
                  : '-'}{' '}
                ETH
              </Text>
              <Button
                disabled={
                  profit.unclaimedKeyGameIds.length === 0 ||
                  profit.unclaimedKeyDividends === '0.0000'
                }
                isLoading={claimKeysLoading}
                onClick={() => handleClaim(0)}
                mt="8px"
                bgColor="#00DAB3"
                w="100%"
                height="52px"
                color="#000"
                fontSize="20px"
                lineHeight="30px">
                Claim
              </Button>
            </Box>
            {/* Final Winner Prize */}
            <Box borderLeft="1px solid #704BEA" pl="30px" flexBasis="33.33%">
              <Text fontSize="16px" color="#FFA8FE" lineHeight="24px">
                My Historical Final Winner Prize
              </Text>
              <Flex alignItems="baseline" mb="36px">
                <Text
                  color="#00DAB3"
                  lineHeight="54px"
                  fontSize="36px"
                  fontWeight="900"
                  mr="10px">
                  {profit.finalWinPrice !== '-'
                    ? // ? BigNumber.from(profit.finalWinPrice)
                      //     .add(BigNumber.from(profit.unclaimedFinalWinPrice))
                      //     .toString()
                      Number(profit.unclaimedFinalWinPrice) +
                      Number(profit.finalWinPrice)
                    : '-'}
                </Text>
                <Text fontSize="16px" lineHeight="24px">
                  ETH
                </Text>
              </Flex>
              <Text
                fontWeight={400}
                fontSize="12px"
                lineHeight="18px"
                color="rgba(255, 255, 255, 0.8)">
                Unclaimed:&nbsp;&nbsp;&nbsp;&nbsp;
                {profit.unclaimedFinalWinPrice !== '-'
                  ? profit.unclaimedFinalWinPrice
                  : '-'}{' '}
                ETH
              </Text>
              <Button
                disabled={profit.unclaimedFinalWinnerGameIds.length === 0}
                isLoading={claimFinalWinnerLoading}
                onClick={() => handleClaim(1)}
                mt="8px"
                bgColor="#00DAB3"
                w="100%"
                height="52px"
                color="#000"
                fontSize="20px"
                lineHeight="30px">
                Claim
              </Button>
            </Box>
            {/* NFT Provider Dividends */}
            <Box
              borderLeft="1px solid #704BEA"
              pl="30px"
              m="0 100px"
              flexBasis="33.33%">
              <Text fontSize="16px" color="#FFA8FE" lineHeight="24px">
                My Historical NFT Provider Dividends
              </Text>
              <Flex alignItems="baseline" mb="16px">
                <Text
                  color="#00DAB3"
                  lineHeight="54px"
                  fontSize="36px"
                  fontWeight="900"
                  mr="10px">
                  {profit.nftDividends !== '-'
                    ? Number(profit.nftDividends) +
                      Number(profit.unclaimedNftDividends)
                    : '-'}
                </Text>
                <Text fontSize="16px" lineHeight="24px">
                  ETH
                </Text>
              </Flex>
              <Text
                fontWeight={400}
                fontSize="12px"
                lineHeight="18px"
                color="rgba(255, 255, 255, 0.8)">
                Unclaimed:&nbsp;&nbsp;&nbsp;&nbsp;
                {profit.unclaimedNftDividends !== '-'
                  ? profit.unclaimedNftDividends
                  : '-'}{' '}
                ETH
              </Text>
              <Text
                fontWeight={400}
                fontSize="12px"
                lineHeight="18px"
                color="rgba(255, 255, 255, 0.8)">
                Locked in ongoing auction: {profit.lockedNftDividends} ETH
              </Text>
              <Button
                disabled={
                  profit.unclaimedNftGameIds.length === 0 ||
                  profit.unclaimedNftDividends === '0.0000'
                }
                isLoading={claimNftLoading}
                onClick={() => handleClaim(2)}
                mt="8px"
                bgColor="#00DAB3"
                w="100%"
                height="52px"
                color="#000"
                fontSize="20px"
                lineHeight="30px">
                Claim
              </Button>
            </Box>
          </Flex>

          <Heading mt="50px" fontSize="20px" fontWeight={800} lineHeight="24px">
            My Dividends & Prize
          </Heading>
          <Box mt="20px" textAlign="center">
            <TabsCommon
              initTab={MyDividendsTabs.UNCLAIMED}
              renderTabs={renderDividends}
              onSwitch={(tab) =>
                handleHistoricalTabChange(tab as MyDividendsTabs)
              }
            />
          </Box>
          <Heading mt="50px" fontSize="20px" fontWeight={800} lineHeight="24px">
            My NFTs
          </Heading>
          <Box mt="20px" textAlign="center">
            <TabsCommon
              variant="nonTabs"
              initTab={MarketTabs.PUBLIC}
              renderTabs={renderNFTS}
            />
          </Box>
        </Box>
      </Box>
      <RedeemModal
        unconvertedGameIds={profit.unconvertedGameIds}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <OmoModal
        omoAmount={profit.flTokens}
        lockedOmoAmount={profit.lockedFlTokens}
        withdrawalAmount={profit.withdrawalAmountTokens}
        type={omoType}
        isOpen={oepnOmo}
        isApproval={isApproval}
        onClose={() => {
          setOpenOmo(false)
          refreshUserHeaderInfo()
        }}
      />
    </Flex>
  )
}
