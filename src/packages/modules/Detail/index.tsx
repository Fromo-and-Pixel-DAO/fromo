import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Input,
  Progress,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { faker } from '@faker-js/faker'
import useCountDown from '@hooks/useCountDown'
import { ellipseAddress } from '@utils'
import { toastError, toastSuccess } from '@utils/toast'
import { ethers } from 'ethers'
import moment from 'moment'
import { useRouter } from 'next/router'
import FroopyABI from 'packages/abis/demo/fl417.json'
import { getGameDetailById } from 'packages/service/api'
import { IGameAmountNft } from 'packages/service/api/types'
import useStore from 'packages/store'
import { web3Modal } from 'packages/web3'
import { memo, useEffect, useMemo, useState } from 'react'
import PurchaseNFTModal from './PurchaseNFTModal'
import Footer from '@components/Footer'

export enum State {
  Upcoming = 0,
  Ongoing = 1,
  Finished = 2,
}

const COUNT = faker.number.int({ min: 101, max: 1000 })

const FL_CONTRACT_ADR = process.env.NEXT_PUBLIC_FL_CONTRACT_ADR

const Details = () => {
  const router = useRouter()

  const { pool: id } = router.query
  // const id = 1

  const { address } = useStore()

  const { nftName } = router.query

  const [claims, setClaims] = useState('0')
  const [keys, setKeys] = useState('0')
  const [claimLoading, setClaimLoading] = useState(false)
  const [buyLoading, setBuyLoading] = useState(false)
  const [withDrawNFTLoading, setWithDrawNFTLoading] = useState(false)
  const [claimsFinalLoading, setClaimsFinalLoading] = useState(false)
  const [retrieveNftLoading, setRetrieveNftLoading] = useState(false)
  const [detailInfos, setDetailInfos] = useState(null)

  const [mintKey, setMintKey] = useState('')

  const [keyDividends, setKeyDividends] = useState('0')

  const [gameAmountNft, setGameAmountNft] = useState<IGameAmountNft>({
    gameId: 0,
    name: '',
    keyDividends: '0',
    imageUrl: '',
    tx: '',
  })

  useEffect(() => {
    init()
    fetchGameDetailById()
  }, [id, router.query])

  const init = () => {
    fetchGameState()
    getGameInfoOfGameIds()
    listenerGame()
  }

  const fetchGameDetailById = async () => {
    if (!address) return null
    getGameDetailById(address, id as any)
      .then((res) => {
        setGameAmountNft(res)
        console.log(res, 'res========')
        setKeyDividends(gameAmountNft.keyDividends)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getGameInfoOfGameIds = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    const [data] = await contract.getGameInfoOfGameIds([id])
    setDetailInfos(data)
    const gameId = await contract.totalGames()
    const [gameInfos] = await contract.getGameInfoOfGameIds([
      Number(gameId - 1).toString(),
    ])

    console.log('gameInfos', gameInfos)
  }

  const fetchGameState = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    const address = await signer.getAddress()
    try {
      const data = await contract.getPlayerStateOfGameIds(address, [id])
      setClaims(data.unclaimBonusList.toString())
      if (data.keyAmountList && data.keyAmountList.toString().length >= 18) {
        data.keyAmountList = ethers.utils.formatUnits(
          data.keyAmountList.toString(),
          'ether',
        )
      }
      console.log('fetchGameState', id, address, data.keyAmountList.toString())
      setKeys(data.keyAmountList.toString())
    } catch (error) {
      console.log(error, '<=-===fetchGameState')
    }
  }

  const memoPercent = useMemo(() => {
    if (!detailInfos?.totalKeyMinted || Number(keys) === 0) return 0
    const percentage =
      (Number(keys) / detailInfos.totalKeyMinted.toNumber()) * 100
    const formattedPercent = Number(percentage.toFixed(2))
      .toString()
      .replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1')
    return formattedPercent
  }, [detailInfos, keys])

  const buyKey = async () => {
    if (!/^[0-9]+$/.test(mintKey))
      return toastError('Integer value is required.')

    if (
      Number(mintKey) > Math.ceil(detailInfos.totalKeyMinted.toNumber() / 10)
    ) {
      toastError(
        `Input numbers must be less than ${Math.ceil(
          detailInfos.totalKeyMinted.toNumber() / 10,
        )} keys`,
      )
      return
    }

    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)

    try {
      setBuyLoading(true)
      const eth =
        parseFloat(ethers.utils.formatEther(detailInfos.keyPrice)) *
        parseInt(mintKey)
      const tx = await contract.purchaseKeyOfGameId(id, {
        value: ethers.utils.parseUnits(`${eth}`, 'ether'),
        gasLimit: BigInt(500000),
      })

      const receipt = await tx.wait()
      const events = receipt.logs.map((log) => contract.interface.parseLog(log))
      const errorEvent = events.find((event) => event.name === 'ErrorEvent')

      console.log('Error:', errorEvent)
      init()
      // await setGameList(library)
      toastSuccess('You have successfully minted keys.')
    } catch (error) {
      console.log(error, 'buyKey')
      toastError('You failed to mint keys due to some error.')
    } finally {
      setBuyLoading(false)
    }
  }

  const claim = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    const address = await signer.getAddress()
    setClaimLoading(true)
    try {
      const tx = await contract.claimBonus([id], address, {
        gasLimit: BigInt(500000),
      })
      await tx.wait()
      toastSuccess('Claim success')
      init()
    } catch (error) {
      console.log(error, 'claim')
    } finally {
      setClaimLoading(false)
    }
  }

  const withdrawSaleRevenue = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    setWithDrawNFTLoading(true)
    try {
      const tx = await contract.withdrawSaleRevenue([id], {
        gasLimit: BigInt(500000),
      })
      await tx.wait()
      init()
      toastSuccess('Withdraw success')
    } catch (error) {
      console.log(error, 'claim')
    } finally {
      setWithDrawNFTLoading(false)
    }
  }

  const claimsFinalPrize = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    setClaimsFinalLoading(true)

    try {
      const tx = await contract.withdrawLastplayerPrize([id], {
        gasLimit: BigInt(500000),
      })
      await tx.wait()
      init()
      toastSuccess('You have successfully claimed dividends or prize.')
    } catch (error) {
      toastError('You failed to claim dividends or prize due to some error.')
      console.log(error, 'claim')
    } finally {
      setClaimsFinalLoading(false)
    }
  }

  const retrieveNft = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    setRetrieveNftLoading(true)

    try {
      const tx = await contract.retrieveNft(id, {
        gasLimit: BigInt(500000),
      })
      await tx.wait()
      init()
      toastSuccess('You have successfully purchased the NFT.', 2000)
    } catch (error) {
      toastError('You failed purchasing the NFT due to some error.', 2000)
      console.log(error, 'retrieveNft')
    } finally {
      setRetrieveNftLoading(false)
    }
  }

  const listenerGame = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    contract.on('GameJoined', () => init())
  }

  // game detailInfo count down
  const localTimeFormatted = useMemo(() => {
    if (!detailInfos) return null
    const date =
      detailInfos.state === State.Upcoming
        ? detailInfos['startTimestamp']
        : detailInfos['endTimestamp']
    return moment(date * 1000).format('YYYY-MM-DD HH:mm:ss')
  }, [detailInfos])

  const PurchaseNFTCountDownPrimary = () => {
    const purchaseTimer = moment(detailInfos.endTimestamp * 1000)
      .add(24, 'hours')
      .format('YYYY-MM-DD HH:mm:ss')
    const { hours, minutes, seconds } = useCountDown(purchaseTimer, () =>
      init(),
    )

    const countDownValuesPrimary = [
      {
        title: hours || '00',
      },
      {
        title: minutes || '00',
      },
      {
        title: seconds || '00',
      },
    ]
    return (
      <Flex gap="2px" alignItems="center">
        {countDownValuesPrimary.map((i, k) => (
          <Flex key={k} color="#FFFFFF">
            {i.title} {k !== 2 && <Box ml="2px">:</Box>}
          </Flex>
        ))}
      </Flex>
    )
  }

  const PurchaseNFTCountDownSecondary = () => {
    const purchaseTimer = moment(detailInfos.endTimestamp * 1000)
      .add(24, 'hours')
      .format('YYYY-MM-DD HH:mm:ss')
    const { days, hours, minutes, seconds } = useCountDown(purchaseTimer, () =>
      init(),
    )

    const countDownValuesSecondary = [
      {
        title: hours || '00',
        details: 'Hours',
      },
      {
        title: minutes || '00',
        details: 'Mins',
      },
      {
        title: seconds || '00',
        details: 'Secs',
      },
    ]

    return (
      <Flex fontSize="16px" color="#00DAB3" w="180px">
        {countDownValuesSecondary.map((i, k) => (
          <Flex key={k}>
            <Flex direction="column" alignItems="center">
              <Box>
                <Flex
                  fontSize="48px"
                  color="#1DFED6"
                  lineHeight="56px"
                  fontWeight="800">
                  {i.title}
                </Flex>
              </Box>
              <Text
                fontSize="12px"
                fontWeight="800"
                color="rgba(255,255,255,0.6)"
                lineHeight="16px">
                {i.details}
              </Text>
            </Flex>
            <Text
              fontSize="48px"
              color="#1DFED6"
              lineHeight="56px"
              fontWeight="800"
              display={k === 2 ? 'none' : ''}
              mx="10px">
              :
            </Text>
          </Flex>
        ))}
      </Flex>
    )
  }

  const nftAuctionDetails = [
    {
      title: 'NFT Address',
      data:
        detailInfos?.nftAddress === ethers.constants.AddressZero
          ? 'The Nft has sold'
          : ellipseAddress(detailInfos?.nftAddress.toLowerCase()) || '--',
    },
    {
      title: 'NFT ID',
      data: detailInfos?.nftId?.toNumber() || '--',
    },
    {
      title: 'Auction ID',
      data: Number(id) + 1,
    },
    {
      title: 'Auction Duration',
      data: (
        <>
          {moment(detailInfos?.startTimestamp * 1000).format('hA')}{' '}
          {moment(detailInfos?.startTimestamp * 1000).format('MMM DD')} -{' '}
          {moment(detailInfos?.endTimestamp * 1000).format('hA')}{' '}
          {moment(detailInfos?.endTimestamp * 1000).format('MMM DD')}
        </>
      ),
    },
    {
      title: 'Auction Status',
      data: (
        <>
          {detailInfos?.state === State.Ongoing
            ? 'Ongoing'
            : detailInfos?.state === State.Upcoming
            ? 'Upcoming'
            : 'Ended'}
        </>
      ),
    },
    {
      title: 'Bonus Pool',
    },
  ]

  const mintingDetails = [
    {
      title: 'Total Keys Minted',
      amount:
        detailInfos?.state === 0
          ? '--'
          : (detailInfos?.totalKeyMinted
              ? detailInfos?.totalKeyMinted.toNumber()
              : '-') || '-',
    },
    {
      title: 'Total Mint Fee',
      amount:
        detailInfos?.state === 0
          ? '--'
          : (detailInfos?.salesRevenue
              ? parseFloat(
                  ethers.utils.formatEther(
                    detailInfos?.salesRevenue.toString(),
                  ),
                ).toFixed(4)
              : '--') || '--',
    },
    {
      title: 'Winner Prize',
      amount:
        detailInfos?.state === 0
          ? '--'
          : (detailInfos?.salesRevenue
              ? parseFloat(
                  ethers.utils.formatEther(
                    detailInfos?.salesRevenue.mul(2).div(10),
                  ),
                ).toFixed(4)
              : '--') || '--',
    },
  ]

  const ownedKeys = () => {
    return (
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb="12px"
        h="28px">
        <Text fontWeight="600" lineHeight="20px">
          Owned Keys:
        </Text>
        <Flex gap="4px">
          <Text
            color="#1DFED6"
            fontSize="24px"
            fontWeight="800"
            lineHeight="10px">
            {detailInfos?.state === 0 ? '--' : keys || '--'}
          </Text>
          <Text color="rgba(255,255,255,0.8)" lineHeight="20px">
            /{' '}
            {detailInfos?.state === 0
              ? '--'
              : detailInfos.totalKeyMinted.toNumber() || '--'}
          </Text>
        </Flex>
      </Flex>
    )
  }

  const progress = () => {
    return (
      <Progress
        colorScheme="primary"
        borderRadius="5px"
        bgColor="#7E4AF1"
        size="md"
        value={Number(memoPercent)}
      />
    )
  }

  if (!detailInfos) return null

  return (
    <Box minH="calc(100vh - 85px)">
      <Box minH="70vh">
        <Box py="20px">
          <Flex
            w="max-content"
            cursor="pointer"
            alignItems="center"
            pl={{ base: '16px', md: '24px', xl: '68px' }}
            onClick={() => router.back()}>
            <ArrowBackIcon fontSize="20px" mr="4px" />
            <Text fontSize="20px" lineHeight="20px">
              Back
            </Text>
          </Flex>
        </Box>
        {detailInfos.state === State.Finished &&
          detailInfos.lastPlayer.toLowerCase() === address && (
            <Flex justifyContent="center">
              <Flex
                background="#FFBD13"
                fontSize={{ base: '20px', xl: '24px' }}
                w="max-content"
                px="33px"
                borderRadius="full"
                py={{ base: '8px', xl: '12px' }}
                fontWeight="800"
                h="52px"
                alignItems="center"
                textTransform="uppercase"
                color="#222222"
                textAlign="center"
                lineHeight="28px">
                You won final prize！
              </Flex>
            </Flex>
          )}
        <Box px={{ base: '16px', md: '24px', xl: '68px' }} py="36px" mb="60px">
          <Box display={{ base: 'block', xl: 'none' }} mb="32px">
            <Image
              m={{ base: 'auto', md: 'unset' }}
              w="180px"
              h="180px"
              objectFit="cover"
              borderRadius="15px"
              alt=""
              src={gameAmountNft.imageUrl}
              fallbackSrc="/static/license-template/template.png"
            />
          </Box>
          <Flex
            direction={{ base: 'column', xl: 'row' }}
            gap="40px"
            justifyContent="space-between">
            <Box w={{ xl: '32.5%' }}>
              <Text
                fontWeight="800"
                lineHeight="44px"
                fontSize={{ base: '32px', md: '36px', xl: '40px' }}
                mb={{ base: '20px', xl: '40px' }}>
                {nftName}
              </Text>
              <Box>
                {detailInfos?.state === State.Finished &&
                  detailInfos?.nftAddress === ethers.constants.AddressZero && (
                    <Flex
                      align="center"
                      justify="center"
                      bg="#737373"
                      w="100%"
                      borderRadius="8px"
                      mb="20px">
                      <Text
                        py="12px"
                        fontSize={{ base: '16px', md: '20px' }}
                        fontWeight="600"
                        lineHeight="24px"
                        color="rgba(255,255,255,0.8)">
                        NFT sold
                      </Text>
                    </Flex>
                  )}

                {/* > 24 Hours  */}

                {detailInfos.state === State.Finished &&
                  detailInfos.nftAddress !== ethers.constants.AddressZero &&
                  moment().isAfter(
                    moment(detailInfos.endTimestamp * 1000).add(24, 'hours'),
                  ) && (
                    <Box>
                      <Button
                        w="330px"
                        colorScheme="primary"
                        alignItems="center"
                        color="#222222"
                        borderRadius="8px"
                        fontWeight="600"
                        py="12px"
                        mb={{ base: '20px', xl: '40px' }}
                        px="20px"
                        gap="8px"
                        fontSize={{ base: '16px', md: '20px' }}
                        lineHeight="24px"
                        isLoading={retrieveNftLoading}
                        onClick={retrieveNft}>
                        <Text>Purchase NFT</Text>
                        <Box>
                          {(
                            detailInfos?.totalKeyMinted.toNumber() * 1.1
                          ).toFixed(4)}{' '}
                          $OMO
                        </Box>
                      </Button>
                    </Box>
                  )}

                {/* top keys holder < 24 Hours */}

                {detailInfos.state === State.Finished &&
                  detailInfos.nftAddress !== ethers.constants.AddressZero &&
                  detailInfos.mostKeyHolder.toLowerCase() === address &&
                  moment().isBefore(
                    moment(detailInfos.endTimestamp * 1000).add(24, 'hours'),
                  ) && (
                    <Tooltip label="The top key holder has priority to purchase the NFT">
                      <Button
                        alignItems="center"
                        display="flex"
                        bg="#737373"
                        color="#222222"
                        w="max-content"
                        py="12px"
                        borderRadius="8px"
                        gap="8px"
                        mb="20px"
                        fontSize={{ base: '16px', md: '20px' }}
                        fontWeight="600"
                        lineHeight="24px"
                        isLoading={retrieveNftLoading}
                        onClick={retrieveNft}
                        disabled={
                          detailInfos.mostKeyHolder ===
                          ethers.constants.AddressZero
                        }>
                        <Text>Purchase NFT</Text>
                        <Text>
                          {(
                            detailInfos.totalKeyMinted.toNumber() * 1.1
                          ).toFixed(4)}{' '}
                          $OMO
                        </Text>

                        <PurchaseNFTCountDownPrimary />
                      </Button>
                    </Tooltip>
                  )}

                <Text mb="12px" fontWeight="600" lineHeight="20px">
                  {detailInfos.state === State.Ongoing
                    ? 'Auction Count Down'
                    : detailInfos.state === State.Upcoming
                    ? 'Opening Count Down'
                    : 'Auction Ended'}
                </Text>

                <Flex>
                  {[State.Ongoing, State.Upcoming].includes(
                    detailInfos?.state,
                  ) && (
                    <>
                      <PurchaseNFTCountDownSecondary />
                    </>
                  )}
                </Flex>

                {State.Finished === detailInfos.state && (
                  <Text
                    color="rgba(255,255,255,0.6)"
                    fontWeight="800"
                    fontSize="20px"
                    lineHeight="24px">
                    {moment(detailInfos?.endTimestamp * 1000).format('MMMM DD')}{' '}
                    at{' '}
                    {moment(detailInfos?.endTimestamp * 1000).format('h:mm A')}
                  </Text>
                )}

                <Box>
                  <Flex direction="column" gap="12px" mt="52px">
                    {nftAuctionDetails.map((i, k) => (
                      <Flex key={k} gap="12px" alignItems="center">
                        <Text lineHeight="20px">{i.title}</Text>
                        <Box
                          color={k === 0 ? '#1DFED6' : ''}
                          lineHeight="20px"
                          fontWeight="600">
                          {i.data}
                        </Box>
                      </Flex>
                    ))}
                  </Flex>

                  <Flex
                    mt="20px"
                    flexWrap={{ base: 'wrap', xl: 'nowrap' }}
                    gap={{ base: '20px', xl: '0px' }}>
                    {mintingDetails.map((i, k) => (
                      <Flex key={k}>
                        <Box>
                          <Flex
                            alignItems="center"
                            fontWeight="800"
                            fontSize={{ base: '24px', md: '28px', xl: '32px' }}
                            lineHeight="36px"
                            gap="8px">
                            <Image
                              src="/static/common/eth-index.svg"
                              alt="ethereum"
                              w="12px"
                              h="20px"
                            />
                            {i.amount}
                          </Flex>
                          <Text
                            whiteSpace="nowrap"
                            fontWeight="600"
                            fontSize="12px"
                            color="rgba(255,255,255,0.6)">
                            {i.title}
                          </Text>
                        </Box>
                        <Divider
                          display={k !== 2 ? '' : 'none'}
                          orientation="vertical"
                          h="54px"
                          mx="16px"
                        />
                      </Flex>
                    ))}
                  </Flex>
                </Box>
              </Box>
            </Box>

            <Box w="35%" display={{ base: 'none', xl: 'block' }}>
              <Image
                w="100%"
                h="532px"
                objectFit="cover"
                borderRadius="15px"
                alt=""
                src={gameAmountNft.imageUrl}
                fallbackSrc="/static/license-template/template.png"
              />
            </Box>

            <Box w={{ xl: '32.5%' }}>
              <Flex justifyContent="space-between">
                <Text
                  textTransform="uppercase"
                  lineHeight="20px"
                  fontWeight="600">
                  Final Key Holder
                </Text>
              </Flex>

              <Box
                mt="20px"
                mb={{ base: '40px', xl: '58px' }}
                fontSize="32px"
                lineHeight="36px"
                fontWeight="800"
                color="#1DFED6">
                {detailInfos.state === 0
                  ? '--'
                  : ellipseAddress(detailInfos.lastPlayer.toLowerCase())}
              </Box>

              <Flex direction="column" gap="20px">
                <Text
                  textTransform="uppercase"
                  lineHeight="20px"
                  fontWeight="600">
                  My Keys, Dividends & Prize
                </Text>

                {/* My Final Winner Prize */}

                {detailInfos?.state === State.Finished &&
                  detailInfos?.lastPlayer.toLowerCase() === address && (
                    <Flex
                      justifyContent="space-between"
                      px="24px"
                      py="20px"
                      bg="#5E36B8"
                      borderRadius="16px">
                      <Box>
                        <Flex alignItems="center">
                          <Image
                            src="/static/common/eth-index.svg"
                            alt="ethereum"
                            w="12px"
                            h="20px"
                            mr="8px"
                          />
                          <Text
                            fontSize="24px"
                            color="#1DFED6"
                            fontWeight="800"
                            lineHeight="28px">
                            {detailInfos?.lastPlayer ===
                            ethers.constants.AddressZero
                              ? '--'
                              : parseFloat(
                                  ethers.utils.formatEther(
                                    detailInfos?.salesRevenue.mul(2).div(10),
                                  ),
                                ).toFixed(4)}
                          </Text>
                        </Flex>
                        <Text
                          fontWeight="600"
                          fontSize="12px"
                          lineHeight="16px"
                          color="rgba(255,255,255,0.8)"
                          mt="4px">
                          My Final Winner Prize
                        </Text>
                      </Box>
                      <Button
                        colorScheme="primary"
                        w="120px"
                        justifyContent="center"
                        alignItems="center"
                        cursor="pointer"
                        p="12px 40px"
                        onClick={claimsFinalPrize}
                        isLoading={claimsFinalLoading}
                        disabled={
                          detailInfos?.lastPlayer ===
                          ethers.constants.AddressZero
                        }
                        borderRadius="8px">
                        <Text
                          color="#222222"
                          fontWeight="600"
                          lineHeight="16px"
                          fontSize="14px">
                          Claim
                        </Text>
                      </Button>
                    </Flex>
                  )}

                <Box
                  w={{ base: '100%', md: '50%', xl: '100%' }}
                  px="24px"
                  py="20px"
                  bg="#5E36B8"
                  borderRadius="16px">
                  <Box>
                    {ownedKeys()}
                    {progress()}

                    {/* Mint Key   */}
                    {detailInfos.state !== State.Finished && (
                      <Box>
                        <Flex
                          alignItems="center"
                          mt="28px"
                          h="44px"
                          gap="12px"
                          w="100%">
                          <Box bg="#472988" borderRadius="8px" w="100%">
                            <Input
                              px="12px"
                              py="14px"
                              type="number"
                              onChange={(e: any) => setMintKey(e.target.value)}
                              disabled={
                                buyLoading ||
                                detailInfos?.state === State.Upcoming ||
                                detailInfos?.state === State.Finished
                              }
                              placeholder={`Maximum: ${(
                                Math.floor(
                                  detailInfos?.totalKeyMinted.toNumber() / 10,
                                ) + 1
                              ).toFixed(4)} keys`}
                              border="none"
                            />
                          </Box>
                          <Button
                            w="104px"
                            disabled={
                              buyLoading ||
                              detailInfos?.state === State.Upcoming
                            }
                            borderRadius="8px"
                            colorScheme="primary"
                            fontWeight="600"
                            fontSize="14px"
                            isLoading={buyLoading}
                            onClick={buyKey}
                            color="#222222">
                            Mint Key
                          </Button>
                        </Flex>
                        <Flex
                          fontSize="14px"
                          mt="12px"
                          gap="24px"
                          alignItems="center">
                          <Flex alignItems="center" gap="4px">
                            Mint Fee:{' '}
                            <Box fontWeight="600">
                              {detailInfos?.state === 0
                                ? '--'
                                : parseFloat(
                                    ethers.utils.formatEther(
                                      detailInfos?.keyPrice?.toString(),
                                    ),
                                  ).toFixed(4)}
                            </Box>{' '}
                            ETH/KEY
                          </Flex>
                          <Flex alignItems="center" gap="4px">
                            Total :{' '}
                            <Box fontWeight="600">
                              {mintKey && detailInfos?.keyPrice
                                ? (
                                    parseFloat(
                                      ethers.utils.formatEther(
                                        detailInfos?.keyPrice,
                                      ),
                                    ) * parseInt(mintKey)
                                  ).toFixed(4)
                                : '--'}
                            </Box>{' '}
                            ETH
                          </Flex>
                        </Flex>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* ??? */}
                {/* <Box
                px="24px"
                py="20px"
                bg="#2F2B50"
                borderRadius="8px"
                mt="20px">
                {ownedKeys()}
                {progress()}
              </Box> */}

                <Flex alignItems="center" gap={{ base: '8px', xl: '20px' }}>
                  {/* My Key Holder Dividends */}
                  <Flex
                    w={{ base: '50%', md: '30%', xl: '50%' }}
                    direction="column"
                    justifyItems="center"
                    alignItems="center"
                    bg="#2F2B50"
                    borderRadius="16px"
                    px="16px"
                    py="20px">
                    <Flex alignItems="center" gap="8px">
                      <Image
                        src="/static/common/eth-index.svg"
                        alt="ethereum"
                        w="12px"
                        h="20px"
                      />
                      <Box
                        fontSize={{ base: '20px', xl: '24px' }}
                        fontWeight="800"
                        lineHeight="28px">
                        {(
                          Number(keyDividends) +
                          Number(ethers.utils.formatEther(claims))
                        ).toFixed(4)}
                      </Box>
                    </Flex>
                    <Text
                      fontWeight="600"
                      fontSize="12px"
                      lineHeight="16px"
                      color="rgba(255,255,255,0.6)"
                      mb="12px"
                      mt="4px">
                      Key Holder Dividends
                    </Text>
                    <Button
                      w="156px"
                      borderRadius="8px"
                      colorScheme="primary"
                      fontWeight="600"
                      fontSize={{ base: '12px', xl: '14px' }}
                      color="#222222"
                      onClick={claim}
                      disabled={
                        detailInfos.state === State.Upcoming ||
                        claimLoading ||
                        Number(claims) === 0
                      }
                      isLoading={claimLoading}>
                      {Number(claims) === 0
                        ? '--'
                        : Number(ethers.utils.formatEther(claims)).toFixed(
                            4,
                          )}{' '}
                      Unclaimed
                    </Button>
                  </Flex>
                  {/* My NFT Provider Dividends */}

                  {detailInfos.principal.toLowerCase() === address && (
                    <Flex
                      w={{ base: '50%', md: '30%', xl: '50%' }}
                      direction="column"
                      justifyItems="center"
                      alignItems="center"
                      bg="#2F2B50"
                      borderRadius="16px"
                      px="16px"
                      py="20px">
                      <Flex alignItems="center" gap="8px">
                        <Image
                          src="/static/common/eth-index.svg"
                          alt="ethereum"
                          w="12px"
                          h="20px"
                        />
                        <Box
                          fontSize={{ base: '20px', xl: '24px' }}
                          fontWeight="800"
                          lineHeight="28px">
                          {detailInfos.principal ===
                          ethers.constants.AddressZero
                            ? '--'
                            : parseFloat(
                                ethers.utils.formatEther(
                                  detailInfos.salesRevenue.mul(5).div(10),
                                ),
                              ).toFixed(4)}
                        </Box>
                      </Flex>
                      <Text
                        fontWeight="600"
                        fontSize="12px"
                        lineHeight="16px"
                        color="rgba(255,255,255,0.6)"
                        mb="12px"
                        mt="4px">
                        NFT Provider Dividends
                      </Text>
                      <Button
                        isLoading={withDrawNFTLoading}
                        onClick={withdrawSaleRevenue}
                        disabled={
                          [State.Upcoming, State.Ongoing].includes(
                            detailInfos.state,
                          ) ||
                          detailInfos.principal ===
                            ethers.constants.AddressZero ||
                          withDrawNFTLoading
                        }
                        w="156px"
                        borderRadius="8px"
                        colorScheme="primary"
                        fontWeight="600"
                        fontSize={{ base: '12px', xl: '14px' }}
                        color="#222222">
                        {detailInfos.principal === ethers.constants.AddressZero
                          ? '--'
                          : parseFloat(
                              ethers.utils.formatEther(
                                detailInfos.salesRevenue.mul(5).div(10),
                              ),
                            ).toFixed(4)}{' '}
                        Unclaimed
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Box>
        <PurchaseNFTModal isOpen={false} onClose={null} />
      </Box>
      <Footer />
    </Box>
  )
}

export default memo(Details)
