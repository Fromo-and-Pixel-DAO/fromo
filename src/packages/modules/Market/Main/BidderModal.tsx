import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'

import BaseModal from '@components/Modal'
import { ellipseAddress, formatNumberWithCommas } from '@utils'
import { toastError } from '@utils/toast'
import { ethers } from 'ethers'
import FroopyABI from 'packages/abis/demo/fl417.json'
import { getBidderForm } from 'packages/service/api'
import { IBidInfo } from 'packages/service/api/types'
import useStore from 'packages/store'
import { ActivityStatus } from 'packages/store/auctions'
import { web3Modal } from 'packages/web3'
import { useEffect, useMemo, useRef, useState } from 'react'
import Web3 from 'web3'

const FL_CONTRACT_ADR: string = process.env
  .NEXT_PUBLIC_FL_CONTRACT_ADR as string

let contract: any = null

type SubmitOfferModalProps = {
  status: number
  isOpen: boolean
  onClose: () => void
}

const BidModal = ({ status, isOpen, onClose }: SubmitOfferModalProps) => {
  const [value, setValue] = useState('')
  const [list, setList] = useState<IBidInfo[]>([])

  const [availableNums, setAvailableNums] = useState<any>()

  const scrollRef = useRef(null)
  const [bidLoading, setBidLoading] = useState(false)

  const customVariant: 'bidModal' | 'bidModalMobile' =
    useBreakpointValue({
      base: 'bidModalMobile',
      md: 'bidModal',
    }) ?? 'bidModal'

  const { address } = useStore()

  const isLowPrice = useMemo(() => {
    return list.some((k) => {
      return Number(value) < Number(Number(k.amount) + 0.0001)
    })
  }, [list, value])

  const bidList = useMemo(
    () => list.slice().sort((a, b) => Number(b.amount) - Number(a.amount)),
    [list],
  )

  const handleBid = async () => {
    if (!value) return toastError('Please bid the price.')

    if (isLowPrice)
      return toastError('Bid must be higher than the current highest bid.')

    if (parseFloat(value) > parseFloat(availableNums))
      return toastError(
        'Bid must be lower than the current available $OMO Token',
      )

    try {
      setBidLoading(true)

      const provider = await web3Modal.connect()
      const web3 = new Web3(provider)
      let nftContract = new web3.eth.Contract(FroopyABI, FL_CONTRACT_ADR)
      const [address] = await web3.eth.getAccounts()
      console.log(ethers.utils.parseEther(value))
      await nftContract?.methods
        .bidLand(ethers.utils.parseEther(value))
        .send({
          from: address,
        })
        .on('receipt', async (nftTxn: any) => {
          await getBidList().finally(() => setBidLoading(false))
          setBidLoading(false)
        })
        .on('error', function (error: string) {})

      // const existingItemIndex = bidList.findIndex(item => item.userAddress === address)

      // if (existingItemIndex !== -1) {
      //   const updatedBidList = [...bidList]
      //   updatedBidList[existingItemIndex].amount = parseFloat(value)
      //   setList(updatedBidList)
      // } else {
      //   setList(prevList => [...prevList, {
      //     amount: parseFloat(value),
      //     userAddress: address,
      //   }])
      // }
    } catch (error) {
      setBidLoading(false)
      const errorMessage =
        (error as Error)?.message || 'The transaction has failed'
      toastError(errorMessage, 2000)
    }
  }

  const getAvailableFL = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()

    if (!contract) {
      contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    }

    contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)

    const address = await signer.getAddress()

    if (!address) return toastError('Please connect wallet first.')

    try {
      const tx = await contract.getBidderInfoOf(address)
      setAvailableNums(
        ethers.utils.formatEther(tx.withdrawableAmount.toString()),
      )
    } catch (error) {
      console.log(error, '<====getAvailableFL')
    }
  }

  const registerUpdateSOL = async () => {
    if (!contract) {
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()

      contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)
    }

    console.log('registerUpdateSOL')

    contract.on('NewBids', (Bidder, amount, bidId) => {
      console.log(
        Bidder,
        amount.toString(),
        bidId.toString(),
        'Bidder, amount, bidId',
      )
      getBidList().finally(() => setBidLoading(false))
    })
  }

  const removeListener = () => {
    if (contract) {
      contract.removeAllListeners('NewBids')
    }
  }

  const getBidList = async () => {
    const data = await getBidderForm()
    setList(data)
  }

  useEffect(() => {
    getAvailableFL()
    getBidList()
    registerUpdateSOL()
  }, [])

  return (
    <BaseModal
      variant={customVariant}
      size={{ base: 'xs', md: 'xl' }}
      isOpen={isOpen}
      isCloseBtn={false}
      title={
        <Heading
          color="white"
          fontSize={{ base: '20px', xl: '28px' }}
          lineHeight="32px"
          textAlign="left"
          fontWeight="800">
          Bid on this Plot of FROMO
        </Heading>
      }
      bgColor="#2F2B50">
      <VStack pos="relative" align="left">
        <Box
          onClick={() => {
            removeListener()
            onClose()
          }}
          p="16px"
          pos="absolute"
          top={{ base: '-96px', md: '-116px' }}
          cursor="pointer"
          right={{ base: '-16px', md: '-28px' }}>
          <Image alt="" w="14px" h="14px" src="/static/common/close.svg" />
        </Box>
        <Text
          lineHeight="20px"
          fontSize={{ base: '14px', xl: '16px' }}
          color="rgba(255,255,255,0.8)"
          pb="24px">
          The highest bidder will have the opportunity to auction their NFT in
          the next round.
        </Text>
        <Box overflow="auto" ref={scrollRef}>
          {bidList.length > 0 && (
            <Flex>
              <Text
                w="178px"
                align="left"
                mr="82px"
                color="rgba(255,255,255,0.6)">
                BIDDER
              </Text>
              <Text color="rgba(255,255,255,0.6)">BID</Text>
            </Flex>
          )}
          <Box height={bidList.length === 0 ? 0 : '220px'}>
            {bidList.map((item, v) => (
              <Flex
                key={item.userAddress}
                py="10px"
                gap={{ base: '20px', md: '0px' }}
                align="center"
                mb="10px">
                <Flex align="center" w="200px" mr="60px">
                  <Image
                    mr="12px"
                    borderRadius="full"
                    src="/static/account/sidebar/avatar.svg"
                    alt="avatar"
                    w="24px"
                    h="24px"
                  />
                  <Box color="white" fontSize="16px" w="160px">
                    {ellipseAddress(item.userAddress, 6)}
                  </Box>
                </Flex>
                <Text
                  align="left"
                  flex={1}
                  fontSize="16px"
                  color="white"
                  whiteSpace="nowrap"
                  fontWeight="600">
                  {parseFloat(`${item.amount}`).toFixed(4)} $OMO Token
                </Text>

                {item.userAddress === address && (
                  <Flex alignItems="center" gap="4px">
                    <Image
                      src="/static/common/arrow-left.svg"
                      alt=""
                      w="10px"
                      h="20px"
                    />
                    <Text color="#1DFED6" fontWeight="600">
                      ME
                    </Text>
                  </Flex>
                )}
              </Flex>
            ))}
          </Box>
        </Box>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap="20px"
          alignItems="center"
          align="baseline"
          visibility={
            status && status === ActivityStatus.Bidding ? 'visible' : 'hidden'
          }>
          <Flex
            px="20px"
            py="16px"
            h="56px"
            borderRadius="8px"
            alignItems="center"
            bg="#0B063B">
            <Text color="rgba(255,255,255,0.6)">Bid:</Text>
            <Input
              _focusVisible={{
                borderWidth: '0px',
              }}
              type="number"
              color="white"
              fontSize="20px"
              fontWeight="600"
              border="none"
              onChange={(e) => setValue(e.target.value)}
            />
            <Text
              color="rgba(255,255,255,0.4)"
              fontSize="20px"
              fontWeight="600"
              lineHeight="24px">
              $OMO
            </Text>
          </Flex>
          <Button
            w="160px"
            h={{ base: '52px', xl: '56px' }}
            borderRadius="8px"
            fontSize="20px"
            fontWeight="600"
            color="#222222"
            bg="#1DFED6"
            _hover={{ bg: '#1DFED6' }}
            onClick={handleBid}
            disabled={availableNums <= 0 || bidLoading}
            isLoading={bidLoading}>
            Bid
          </Button>
        </Flex>
        <Box pb="12px">
          <Flex fontSize="12px" color="rgba(255,255,255,0.6)">
            Available：
            <Text mr="4px" fontWeight="600">
              {' '}
              {formatNumberWithCommas(availableNums)} $OMO
            </Text>{' '}
            Token
          </Flex>
        </Box>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          bg="#4C467B"
          py="16px"
          px="20px"
          borderRadius="12px">
          <Image
            src="/static/common/info.svg"
            alt="info"
            w="16px"
            h="16px"
            mr="12px"
            mb="8px"
          />
          <Text textAlign="justify" color="white" fontSize="12px">
            The $OMO you bid is used to purchase the FROMO plot. It will be
            locked until the bidding ends. If you lose the FROMO plot, it will
            be unlocked after the bidding ends. The FROMO plot winner who failed
            to stake NFT will lose the $OMO he/she bid.
          </Text>
        </Flex>
      </VStack>
    </BaseModal>
  )
}

export default BidModal
