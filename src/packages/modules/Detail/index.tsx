import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Input,
  Link,
  List,
  Progress,
  Text,
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
import styles from './index.module.scss'

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

  // TODO: 未登录情况，拦截链接钱包？
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
        setKeyDividends(gameAmountNft.keyDividends)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // 获取详细信息 - sol
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

  // 获取 claims 信息以及 mykey sol
  const fetchGameState = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    const address = await signer.getAddress()
    try {
      console.log('fetchGameState', id, address)

      const data = await contract.getPlayerStateOfGameIds(address, [id])
      setClaims(data.unclaimBonusList.toString())
      if (data.keyAmountList && data.keyAmountList.toString().length >= 18) {
        data.keyAmountList = 0
      }
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

  // todo 刷新 监听游戏是否有人买入 key
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

  const { hours, minutes, seconds } = useCountDown(localTimeFormatted, () =>
    init(),
  )

  const ActivityCountDown = () => {
    return (
      <div className={styles.time}>
        <div className={styles.unit}>{hours || '0'}</div>
        <div className={styles.symbol}>Hrs</div>
        <div className={styles.unit}>{minutes || '0'}</div>
        <div className={styles.symbol}>Mins</div>
        <div className={styles.unit}>{seconds || '0'}</div>
        <div className={styles.symbol}>Secs</div>
      </div>
    )
  }

  const PurchaseNFTCountDown = () => {
    const purchaseTimer = moment(detailInfos.endTimestamp * 1000)
      .add(24, 'hours')
      .format('YYYY-MM-DD HH:mm:ss')
    const { hours, minutes, seconds } = useCountDown(purchaseTimer, () =>
      init(),
    )
    return (
      <Flex fontSize="16px" color="#00DAB3" w="180px">
        <Text mr="4px">{hours || '0'}</Text>
        <Text mr="4px">Hrs</Text>
        <Text mr="4px">{minutes || '0'}</Text>
        <Text mr="4px">Mins</Text>
        <Text mr="4px">{seconds || '0'}</Text>
        <Text>Secs</Text>
      </Flex>
    )
  }

  if (!detailInfos) return null

  return (
    <>
      <Flex
        w="120px"
        m="0 0 16px"
        h="52px"
        cursor="pointer"
        alignItems="center"
        padding="0 42px"
        onClick={() => router.back()}>
        <ArrowBackIcon mr="10px" />
        <Text fontSize="20px">Back</Text>
      </Flex>
      {detailInfos.state === State.Finished &&
        detailInfos.lastPlayer.toLowerCase() === address && (
          <Box
            m="0 auto;"
            borderRadius="20px 20px 0px 0px"
            background="linear-gradient(180deg, #764AF2 0%, #9A4DEE 201.25%)"
            fontSize="28px"
            w={{ lg: '1280px', md: '1120px' }}
            h="80px"
            fontWeight={900}
            textAlign="center"
            lineHeight="80px">
            YOU WON THE FINAL PRIZE！
          </Box>
        )}
      <Box
        borderRadius={
          detailInfos?.state === State.Finished &&
          detailInfos?.lastPlayer.toLowerCase() === address
            ? '0 0 20px 20px'
            : '20px'
        }
        p="48px"
        w={{ lg: '1280px', md: '1120px' }}
        className={styles.box}>
        {detailInfos.state === State.Finished &&
          detailInfos.nftAddress === ethers.constants.AddressZero && (
            <Flex
              align="center"
              justify="center"
              border="1px solid rgba(112, 75, 234, 1)"
              w="100%"
              borderRadius="20px"
              p="24px 32px"
              mb="20px">
              <Image
                mr="12px"
                src={gameAmountNft.imageUrl}
                alt="f"
                w="24px"
                h="24px"></Image>
              <Text fontSize="24px" color="#9A7CFF">
                NFT sold
              </Text>
            </Flex>
          )}
        {/* top keys holder 优先赎回权 && 时间小于 24 小时 */}
        {detailInfos.state === State.Finished &&
          detailInfos.nftAddress !== ethers.constants.AddressZero &&
          detailInfos.mostKeyHolder.toLowerCase() === address &&
          moment().isBefore(
            moment(detailInfos.endTimestamp * 1000).add(24, 'hours'),
          ) && (
            <Flex
              border="1px solid rgba(112, 75, 234, 1)"
              w="100%"
              borderRadius="20px"
              p="24px 32px"
              justifyContent="space-between"
              mb="20px">
              <Flex flexDir="column">
                <Flex
                  fontSize="14px"
                  color="#fff"
                  flex={1}
                  mr="40px"
                  align="center">
                  <Text mr="8px">
                    The top key holder has priority to purchase the NFT in
                  </Text>
                  <PurchaseNFTCountDown />.
                </Flex>
                <Flex
                  fontSize="14px"
                  color="#fff"
                  flex={1}
                  mr="40px"
                  align="center">
                  <Text fontSize="16px" color="#FFA8FE" mr="20px">
                    NFT Price:
                  </Text>
                  <Text fontSize="16px">
                    {(detailInfos.totalKeyMinted.toNumber() * 1.1).toFixed(4)}{' '}
                    $OMO Token
                  </Text>
                </Flex>
              </Flex>

              <Button
                fontSize="20px"
                colorScheme="primary"
                w="272px"
                h="52px"
                ml="24px"
                isLoading={retrieveNftLoading}
                onClick={retrieveNft}
                fontWeight="700"
                disabled={
                  detailInfos.mostKeyHolder === ethers.constants.AddressZero
                }
                color="#000">
                Purchase NFT
              </Button>
            </Flex>
          )}

        {/* 24 小时以外 */}
        {detailInfos.state === State.Finished &&
          detailInfos.nftAddress !== ethers.constants.AddressZero &&
          moment().isAfter(
            moment(detailInfos.endTimestamp * 1000).add(24, 'hours'),
          ) && (
            <Flex
              border="1px solid rgba(112, 75, 234, 1)"
              w="100%"
              borderRadius="20px"
              p="24px 32px"
              justifyContent="space-between"
              mb="20px">
              <Flex
                fontSize="14px"
                color="#fff"
                flex={1}
                mr="40px"
                align="center">
                <Text fontSize="16px" color="#FFA8FE" mr="20px">
                  NFT Price:
                </Text>
                <Text fontSize="16px">
                  {(detailInfos.totalKeyMinted.toNumber() * 1.1).toFixed(4)}{' '}
                  $OMO Token
                </Text>
              </Flex>
              <Button
                fontSize="20px"
                colorScheme="primary"
                w="272px"
                h="52px"
                ml="24px"
                fontWeight="700"
                isLoading={retrieveNftLoading}
                onClick={retrieveNft}
                color="#000">
                Purchase NFT
              </Button>
            </Flex>
          )}

        <Flex>
          <Box className={styles.nft}>
            <Image
              w="500px"
              h="500px"
              objectFit="cover"
              borderRadius="15px"
              alt=""
              src={gameAmountNft.imageUrl}
              fallbackSrc="/static/license-template/template.png"
            />
            <Text className={styles.desc}>{detailInfos.nftName}</Text>
            <List spacing={3}>
              <Flex alignItems="center">
                <Text className={styles.name}>Auction ID：</Text>
                <Text fontWeight={600}>{id}</Text>
              </Flex>
              <Flex alignItems="center">
                <Text className={styles.name}>NFT Address：</Text>
                <Link fontWeight={600} color="#00DAB3">
                  {detailInfos.nftAddress === ethers.constants.AddressZero
                    ? 'The Nft has sold'
                    : detailInfos.nftAddress || '--'}
                </Link>
              </Flex>
              <Flex alignItems="center">
                <Text className={styles.name}>NFT ID：</Text>
                <Text fontWeight={600}>
                  {detailInfos?.nftId?.toNumber() || '--'}
                </Text>
              </Flex>
              <Flex alignItems="center">
                <Text className={styles.name}>Auction Duration：</Text>
                <Text fontWeight={600}>
                  {moment(detailInfos.startTimestamp * 1000).format('hA')}{' '}
                  {moment(detailInfos.startTimestamp * 1000).format('MMM DD')} -{' '}
                  {moment(detailInfos.endTimestamp * 1000).format('hA')}{' '}
                  {moment(detailInfos.endTimestamp * 1000).format('MMM DD')}
                </Text>
              </Flex>
            </List>
            <Text
              fontWeight={600}
              m="40px 0 20px"
              fontSize="20px"
              lineHeight="20px">
              Auction Rules
            </Text>
            <List spacing={3}>
              <Flex>
                <Text
                  color="#FFA8FE"
                  fontSize="16px"
                  lineHeight="20px"
                  w="172px">
                  Final Winner prize：
                </Text>
                <Text w="290px" fontSize="16px" lineHeight="24px">
                  The last key holder gets 20% of the total mint fee. The prize
                  can be claimed after the game gets over.
                </Text>
              </Flex>
              <Flex>
                <Text
                  color="#FFA8FE"
                  fontSize="16px"
                  lineHeight="20px"
                  w="172px">
                  Key Holder Dividends：
                </Text>
                <Text w="290px" fontSize="16px" lineHeight="24px">
                  Key holders share 20% of following mint fee depends on held
                  key share. The dividends can be claimed during and after the
                  game.
                </Text>
              </Flex>
              <Flex>
                <Text
                  color="#FFA8FE"
                  fontSize="16px"
                  lineHeight="20px"
                  w="172px">
                  NFT Provider Dividends：
                </Text>
                <Text w="290px" fontSize="16px" lineHeight="24px">
                  The NFT provider shares 50% of the total mint fee. The
                  dividends can be claimed after the game.{' '}
                </Text>
              </Flex>
            </List>
          </Box>
          <Box className={styles.info}>
            <Heading
              fontSize="24px"
              lineHeight="36px"
              fontWeight={700}
              mb="16px">
              {detailInfos.state === State.Ongoing
                ? 'Auction Count Down'
                : detailInfos.state === State.Upcoming
                ? 'Opening Count Down'
                : 'Auction Status'}
            </Heading>
            <Box
              borderRadius="20px"
              p="16px 0 16px 32px"
              bgColor="rgba(118, 74, 242, 0.5)"
              border="1px solid rgba(112, 75, 234, 1)">
              {[State.Ongoing, State.Upcoming].includes(detailInfos.state) && (
                <ActivityCountDown />
              )}
              {State.Finished === detailInfos.state && (
                <Text fontSize="24px" lineHeight="36px">
                  Auction ends{' '}
                  {moment(detailInfos.endTimestamp * 1000).format('MMMM DD')} at{' '}
                  {moment(detailInfos.endTimestamp * 1000).format('h:mm A')}
                </Text>
              )}
            </Box>

            <Heading
              mt="36px"
              fontSize="24px"
              lineHeight="36px"
              fontWeight={700}
              mb="16px">
              Bonus Pool
            </Heading>
            <Grid
              gap="32px"
              borderRadius="20px"
              p="32px"
              gridTemplateColumns="1fr 1fr"
              bgColor="rgba(118, 74, 242, 0.5)"
              border="1px solid rgba(112, 75, 234, 1)">
              <Flex flexDir="column">
                <Box
                  w={{ lg: '100%' }}
                  fontSize="16px"
                  lineHeight="24px"
                  color="#FFA8FE">
                  Total Keys Minted
                </Box>
                <Flex alignItems="baseline">
                  <Text
                    mr="8px"
                    fontWeight={900}
                    color="#00DAB3"
                    fontSize="40px"
                    lineHeight="60px">
                    {detailInfos.state === 0
                      ? '--'
                      : detailInfos.totalKeyMinted.toNumber() || '-'}
                  </Text>
                  <Text fontWeight={700} fontSize="16px" lineHeight="24px">
                    KEYS
                  </Text>
                </Flex>
              </Flex>
              <Flex flexDir="column">
                <Box
                  w={{ lg: '100%' }}
                  fontSize="16px"
                  lineHeight="24px"
                  color="#FFA8FE">
                  Total Mint Fee
                </Box>
                <Flex>
                  <Flex>
                    <Image
                      mr="4px"
                      src="./static/market/eth.svg"
                      alt="ethereum"
                      color="#fff"></Image>
                    <Text
                      mr="8px"
                      fontWeight={900}
                      color="#00DAB3"
                      fontSize="40px"
                      lineHeight="60px">
                      {detailInfos.state === 0
                        ? '--'
                        : parseFloat(
                            ethers.utils.formatEther(
                              detailInfos.salesRevenue.toString(),
                            ),
                          ).toFixed(4) || '--'}
                    </Text>
                  </Flex>
                  <Text
                    fontWeight={700}
                    alignSelf="flex-end"
                    fontSize="16px"
                    lineHeight="40px">
                    ETH
                  </Text>
                </Flex>
              </Flex>
              <Flex flexDir="column">
                <Box
                  w={{ lg: '100%' }}
                  fontSize="16px"
                  lineHeight="24px"
                  color="#FFA8FE">
                  Final Winner Prize
                </Box>
                <Flex>
                  <Flex>
                    <Image
                      mr="4px"
                      src="./static/market/eth.svg"
                      alt="ethereum"
                      color="#fff"></Image>
                    <Text
                      mr="8px"
                      fontWeight={900}
                      color="#00DAB3"
                      fontSize="40px"
                      lineHeight="60px">
                      {detailInfos.state === 0
                        ? '--'
                        : parseFloat(
                            ethers.utils.formatEther(
                              detailInfos.salesRevenue.mul(2).div(10),
                            ),
                          ).toFixed(4) || '--'}
                    </Text>
                  </Flex>
                  <Text
                    fontWeight={700}
                    alignSelf="flex-end"
                    fontSize="16px"
                    lineHeight="40px">
                    ETH
                  </Text>
                </Flex>
              </Flex>
              <Flex flexDir="column">
                <Box
                  w={{ lg: '100%' }}
                  fontSize="16px"
                  lineHeight="24px"
                  color="#FFA8FE">
                  Final Key Holder
                </Box>
                <Flex mt="20px">
                  <Text color="#00DAB3" fontSize="16px" lineHeight="20px">
                    {detailInfos.state === 0
                      ? '--'
                      : ellipseAddress(detailInfos.lastPlayer.toLowerCase())}
                  </Text>
                </Flex>
              </Flex>
            </Grid>

            <Heading
              mt="36px"
              fontSize="24px"
              lineHeight="36px"
              fontWeight={700}
              mb="16px">
              My Keys, Dividends & Prize
            </Heading>
            <Box
              padding="32px"
              borderRadius="20px"
              border="1px solid rgba(112, 75, 234, 1)">
              <Text
                fontSize="20px"
                lineHeight="30px"
                fontWeight={700}
                mb="16px">
                My Owned Keys
              </Text>
              <Progress
                colorScheme="primary"
                borderRadius="5px"
                bgColor="rgba(42, 6, 104, 0.7)"
                size="sm"
                value={Number(memoPercent)}
              />
              <Flex mt="20px" alignItems="center">
                <Flex mr="32px" alignItems="baseline">
                  <Text
                    fontSize="24px"
                    lineHeight="36px"
                    color="#00DAB3"
                    fontWeight={700}>
                    {detailInfos.state === 0 ? '--' : keys || '--'}
                  </Text>
                  <Text ml="8px" color="#fff" fontSize="16px" lineHeight="24px">
                    Keys
                  </Text>
                </Flex>
                <Flex
                  mr="32px"
                  alignItems="baseline"
                  fontSize="24px"
                  lineHeight="36px"
                  color="#00DAB3"
                  fontWeight={700}>
                  <Text
                    fontSize="24px"
                    lineHeight="36px"
                    color="#00DAB3"
                    fontWeight={700}>
                    {detailInfos.state === 0 ? '--' : memoPercent || '--'}%
                  </Text>
                  <Text ml="8px" color="#fff" fontSize="16px" lineHeight="24px">
                    {' '}
                    of Total Keys Minted
                  </Text>
                </Flex>
              </Flex>

              {/* Mint Key */}
              {detailInfos.state !== State.Finished && (
                <>
                  <Text
                    mt="36px"
                    mb="12px"
                    fontSize="20px"
                    lineHeight="30px"
                    fontWeight={700}>
                    Mint Key
                  </Text>
                  <Flex>
                    <Input
                      w="272px"
                      h="52px"
                      type="number"
                      borderColor="#704BEA"
                      onChange={(e: any) => setMintKey(e.target.value)}
                      disabled={
                        buyLoading ||
                        detailInfos.state === State.Upcoming ||
                        detailInfos.state === State.Finished
                      }
                      placeholder={`Maximum: ${(
                        Math.floor(detailInfos.totalKeyMinted.toNumber() / 10) +
                        1
                      ).toFixed(4)} keys`}
                    />
                    <Button
                      fontSize="20px"
                      colorScheme="primary"
                      w="272px"
                      h="52px"
                      ml="24px"
                      onClick={buyKey}
                      fontWeight="700"
                      color="#000"
                      disabled={
                        buyLoading || detailInfos.state === State.Upcoming
                      }
                      isLoading={buyLoading}>
                      Mint Key
                    </Button>
                  </Flex>
                  <Text fontSize="14px" lineHeight="20px" mt="12px">
                    <span style={{ fontWeight: '700', margin: '0 2px 0 0' }}>
                      Mint Fee：
                      {detailInfos.state === 0
                        ? '--'
                        : parseFloat(
                            ethers.utils.formatEther(
                              detailInfos.keyPrice?.toString(),
                            ),
                          ).toFixed(4)}{' '}
                      ETH/KEY | Total：{' '}
                      {mintKey && detailInfos.keyPrice
                        ? (
                            parseFloat(
                              ethers.utils.formatEther(detailInfos.keyPrice),
                            ) * parseInt(mintKey)
                          ).toFixed(4)
                        : '--'}{' '}
                      ETH
                    </span>
                  </Text>
                </>
              )}
              {/* My Key Holder Dividends */}
              <Flex mt="36px" mb="12px" justifyContent="space-between">
                <Text fontSize="20px" lineHeight="30px" fontWeight={700}>
                  My Key Holder Dividends
                </Text>
                <Text fontSize="16px" lineHeight="24px">
                  Total：
                  <span style={{ fontWeight: '700', margin: '0 2px 0 0' }}>
                    {(
                      Number(keyDividends) +
                      Number(ethers.utils.formatEther(claims))
                    ).toFixed(4)}
                  </span>
                  ETH
                </Text>
              </Flex>
              <Flex>
                <Input
                  w="272px"
                  h="52px"
                  bgColor="rgba(112, 75, 234, 0.5)"
                  border="none"
                  readOnly
                  value={`Unclaimed: ${
                    Number(claims) === 0
                      ? '--'
                      : Number(ethers.utils.formatEther(claims)).toFixed(4)
                  } ETH`}
                />
                <Button
                  fontSize="20px"
                  colorScheme="primary"
                  w="272px"
                  h="52px"
                  ml="24px"
                  onClick={claim}
                  fontWeight="700"
                  color="#000"
                  disabled={
                    detailInfos.state === State.Upcoming ||
                    claimLoading ||
                    Number(claims) === 0
                  }
                  isLoading={claimLoading}>
                  Claim
                </Button>
              </Flex>
              {/* My NFT Provider Dividends */}
              {detailInfos.principal.toLowerCase() === address && (
                <>
                  <Flex mt="36px" mb="12px" justifyContent="space-between">
                    <Text fontSize="20px" lineHeight="30px" fontWeight={700}>
                      My NFT Provider Dividends
                    </Text>
                    <Text fontSize="16px" lineHeight="24px">
                      Total：
                      <span style={{ fontWeight: '700', margin: '0 2px 0 0' }}>
                        {detailInfos.principal === ethers.constants.AddressZero
                          ? '--'
                          : parseFloat(
                              ethers.utils.formatEther(
                                detailInfos.salesRevenue.mul(5).div(10),
                              ),
                            ).toFixed(4)}
                      </span>
                      ETH
                    </Text>
                  </Flex>
                  <Flex>
                    <Input
                      w="272px"
                      h="52px"
                      bgColor="rgba(112, 75, 234, 0.5)"
                      border="none"
                      readOnly
                      value={`Unclaimed: ${
                        detailInfos.principal === ethers.constants.AddressZero
                          ? '--'
                          : parseFloat(
                              ethers.utils.formatEther(
                                detailInfos.salesRevenue.mul(5).div(10),
                              ),
                            ).toFixed(4)
                      } ETH`}
                    />
                    <Button
                      fontSize="20px"
                      colorScheme="primary"
                      w="272px"
                      h="52px"
                      ml="24px"
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
                      fontWeight="700"
                      color="#000">
                      Claim
                    </Button>
                  </Flex>
                </>
              )}
              {/* My Final Winner Prize */}
              {detailInfos.state === State.Finished &&
                detailInfos.lastPlayer.toLowerCase() === address && (
                  <>
                    <Flex mt="36px" mb="12px" justifyContent="space-between">
                      <Text fontSize="20px" lineHeight="30px" fontWeight={700}>
                        My Final Winner Prize
                      </Text>
                      <Text fontSize="16px" lineHeight="24px">
                        Total：
                        <span
                          style={{ fontWeight: '700', margin: '0 2px 0 0' }}>
                          {detailInfos.lastPlayer ===
                          ethers.constants.AddressZero
                            ? '--'
                            : parseFloat(
                                ethers.utils.formatEther(
                                  detailInfos.salesRevenue.mul(2).div(10),
                                ),
                              ).toFixed(4)}
                        </span>
                        ETH
                      </Text>
                    </Flex>
                    <Flex>
                      <Input
                        w="272px"
                        h="52px"
                        bgColor="rgba(112, 75, 234, 0.5)"
                        border="none"
                        readOnly
                        value={`Unclaimed: ${
                          detailInfos.lastPlayer ===
                          ethers.constants.AddressZero
                            ? '--'
                            : parseFloat(
                                ethers.utils.formatEther(
                                  detailInfos.salesRevenue.mul(2).div(10),
                                ),
                              ).toFixed(4)
                        } ETH`}
                      />
                      <Button
                        fontSize="20px"
                        colorScheme="primary"
                        w="272px"
                        h="52px"
                        ml="24px"
                        fontWeight="700"
                        onClick={claimsFinalPrize}
                        isLoading={claimsFinalLoading}
                        disabled={
                          detailInfos.lastPlayer ===
                          ethers.constants.AddressZero
                        }
                        color="#000">
                        Claim
                      </Button>
                    </Flex>
                  </>
                )}
            </Box>
          </Box>
        </Flex>
      </Box>
      <PurchaseNFTModal isOpen={false} onClose={null} />
    </>
  )
}

export default memo(Details)
