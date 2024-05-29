import { lazy, useEffect, useState } from 'react'

import { Box, Button, Flex, Image, Text, useMediaQuery } from '@chakra-ui/react'

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
import Footer from '@components/Footer'

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
          refreshUserHeaderInfo()
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
          refreshUserHeaderInfo()
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
          refreshUserHeaderInfo()
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
        refreshUserHeaderInfo()
      })
  }

  const { address } = useStore()
  const [isLargerThan1920] = useMediaQuery('(min-width: 1920px)')

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

  const myProfileList = [
    {
      title: 'Total Key Holder Dividends',
      amount:
        profit.keyDividends !== '-'
          ? (
              Number(profit.keyDividends) + Number(profit.unclaimedKeyDividends)
            ).toFixed(4)
          : '-',
      unclaimed:
        profit.unclaimedKeyDividends !== '-'
          ? profit.unclaimedKeyDividends
          : '-',
      onclick: () => handleClaim(0),
      isLoading: claimKeysLoading,
      disabled:
        profit.unclaimedKeyGameIds.length === 0 ||
        profit.unclaimedKeyDividends === '0.0000',
    },
    {
      title: 'Total Final Winner Prize',
      amount:
        profit.finalWinPrice !== '-'
          ? // ? BigNumber.from(profit.finalWinPrice)
            //     .add(BigNumber.from(profit.unclaimedFinalWinPrice))
            //     .toString()
            Number(profit.unclaimedFinalWinPrice) + Number(profit.finalWinPrice)
          : '-',
      unclaimed:
        profit.unclaimedFinalWinPrice !== '-'
          ? profit.unclaimedFinalWinPrice
          : '-',
      onclick: () => handleClaim(1),
      isLoading: claimFinalWinnerLoading,
      disabled: profit.unclaimedFinalWinnerGameIds.length === 0,
    },
    {
      title: 'Total NFT Provider Dividends',
      amount:
        profit.nftDividends !== '-'
          ? (
              Number(profit.nftDividends) +
              Number(profit.unclaimedNftDividends) +
              Number(profit.lockedNftDividends)
            ).toFixed(4)
          : '-',
      unclaimed:
        profit.unclaimedNftDividends !== '-'
          ? profit.unclaimedNftDividends
          : '-',
      lockedNft: profit.lockedNftDividends,
      onclick: () => handleClaim(2),
      isLoading: claimNftLoading,
      disabled:
        profit.unclaimedNftGameIds.length === 0 ||
        profit.unclaimedNftDividends === '0.0000',
    },
  ]

  return (
    <Box>
      <Flex>
        <Sidebar />
        <Flex justifyContent="center" w="100%" p="36px 68px 40px 40px">
          <Box w="1044px">
            {/* My Assets */}
            <Box>
              <Text
                fontSize="32px"
                lineHeight="36px"
                fontWeight="800"
                mb="32px">
                My Assets
              </Text>
              <Flex gap="28px">
                <Box
                  w="50%"
                  p="24px 32px"
                  bgColor="#5E36B8"
                  borderRadius="16px">
                  <Text fontWeight="600" lineHeight="20px">
                    My Keys
                  </Text>
                  <Flex alignItems="center" my="12px">
                    <Text
                      color="#1DFED6"
                      lineHeight="44px"
                      fontSize="40px"
                      fontWeight="800"
                      mr="12px">
                      {profit.keys}
                    </Text>
                    <Text color="rgba(255,255,255,0.8)" lineHeight="20px">
                      ≈ 14,634 $OMO
                    </Text>
                  </Flex>
                  <Flex
                    color="rgba(255,255,255,0.8)"
                    lineHeight="16px"
                    mb="20px">
                    Locked for participating NFT auctions:{' '}
                    <Text ml="4px" color="white" fontWeight="600">
                      {' '}
                      {profit.lockedKeys} Keys
                    </Text>
                  </Flex>
                  <Button
                    disabled={
                      profit.keys === '0' ||
                      profit.keys === '-' ||
                      profit.canConvert === 0
                    }
                    isLoading={convertKeysLoading}
                    bgColor="#1DFED6"
                    height="40px"
                    w="50%"
                    alignItems="center"
                    color="#000"
                    fontSize="14px"
                    lineHeight="16px"
                    onClick={redeemKeys}>
                    Redeem
                  </Button>
                </Box>
                <Box
                  w="50%"
                  p="24px 32px"
                  bgColor="#5E36B8"
                  borderRadius="16px">
                  <Text fontWeight="600" lineHeight="20px">
                    My $OMO
                  </Text>
                  <Flex alignItems="center" my="12px">
                    <Text
                      color="#1DFED6"
                      lineHeight="44px"
                      fontSize="40px"
                      fontWeight="800"
                      mr="12px">
                      {profit.flTokens && profit.flTokens !== '-'
                        ? Number(
                            ethers.utils.formatEther(profit.flTokens),
                          ).toFixed(4)
                        : '-'}
                    </Text>
                    <Text color="rgba(255,255,255,0.8)" lineHeight="20px">
                      ≈ 34,3 $OMO
                    </Text>
                  </Flex>
                  <Flex
                    color="rgba(255,255,255,0.8)"
                    lineHeight="16px"
                    mb="20px">
                    Locked for bidding FROMO plot:
                    <Text ml="4px" color="white" fontWeight="600">
                      {profit.lockedFlTokens !== '-'
                        ? Number(
                            ethers.utils.formatEther(profit.lockedFlTokens),
                          ).toFixed(4)
                        : '-'}{' '}
                    </Text>
                  </Flex>

                  <Flex gap="20px">
                    <Button
                      w="50%"
                      alignItems="center"
                      height="40px"
                      border="1px solid white"
                      bg="transparent"
                      fontSize="14px"
                      lineHeight="16px"
                      disabled={
                        profit.flTokens === '0' || profit.flTokens === '-'
                      }
                      onClick={() => handleOpenOmo(0)}>
                      Withdraw
                    </Button>
                    <Button
                      w="50%"
                      alignItems="center"
                      bgColor="#1DFED6"
                      height="40px"
                      color="#000"
                      fontSize="14px"
                      lineHeight="16px"
                      onClick={() => handleOpenOmo(1)}>
                      Deposit
                    </Button>
                  </Flex>
                </Box>
              </Flex>
            </Box>

            {/* My Profit */}
            <Box>
              <Text
                lineHeight="20px"
                fontWeight="600"
                color="#fff"
                mt="40px"
                textTransform="uppercase"
                mb="20px">
                My Profit
              </Text>
              <Flex gap="28px">
                {myProfileList.map((i, k) => (
                  <Box
                    flex={1}
                    key={k}
                    bg="#2F2B50"
                    borderRadius="16px"
                    px="32px"
                    py="20px">
                    <Text fontWeight="600">{i.title} </Text>
                    <Flex my="20px" gap="12px" alignItems="center">
                      <Image
                        src="/static/common/eth-index.svg"
                        alt="ethereum"
                        w="12px"
                        h="20px"
                      />
                      <Text
                        color="#1DFED6"
                        lineHeight="32px"
                        fontSize="28px"
                        fontWeight="800">
                        {i.amount}
                      </Text>
                    </Flex>
                    <Button
                      onClick={i.onclick}
                      disabled={i.disabled}
                      isLoading={i.isLoading}
                      bgColor="#1DFED6"
                      height="40px"
                      px="10px"
                      position="relative"
                      alignItems="center"
                      color="#000"
                      w="100%"
                      fontSize="14px"
                      lineHeight="16px">
                      {i.unclaimed} CLaim
                      {k === 2 && (
                        <Image
                          position="absolute"
                          right="10px"
                          src="/static/profile/help.svg"
                          w="16px"
                          h="16px"
                          alt="help"
                        />
                      )}
                    </Button>
                  </Box>
                ))}
              </Flex>
            </Box>

            {/* My Dividends & Prize */}
            <Box>
              <Text
                lineHeight="20px"
                fontWeight="600"
                color="#fff"
                mt="60px"
                textTransform="uppercase"
                mb="20px">
                Total Dividends & Prize
              </Text>
              <Box textAlign="center">
                <TabsCommon
                  initTab={MyDividendsTabs.UNCLAIMED}
                  renderTabs={renderDividends}
                  onSwitch={(tab) =>
                    handleHistoricalTabChange(tab as MyDividendsTabs)
                  }
                />
              </Box>
              <Text
                lineHeight="20px"
                fontWeight="600"
                color="#fff"
                mt="60px"
                textTransform="uppercase"
                mb="20px">
                My Purchased NFTs
              </Text>
              <Box textAlign="center">
                <TabsCommon
                  variant="nonTabs"
                  initTab={MarketTabs.PUBLIC}
                  renderTabs={renderNFTS}
                />
              </Box>
            </Box>
          </Box>
        </Flex>
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
      <Footer />
    </Box>
  )
}
