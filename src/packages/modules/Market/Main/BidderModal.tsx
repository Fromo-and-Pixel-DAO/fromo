import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'

import BaseModal from '@components/Modal'
import { ellipseAddress, formatNumberWithCommas } from '@utils'
import { toastError } from '@utils/toast'
import { ethers } from 'ethers'
import FroopyABI from 'packages/abis/demo/fl417.json'
import { getBidderForm } from 'packages/service/api'
import { IBidInfo } from 'packages/service/api/types'
import useStore from 'packages/store'
import { web3Modal } from 'packages/web3'
import { useEffect, useMemo, useRef, useState } from 'react'

const FL_CONTRACT_ADR = process.env.NEXT_PUBLIC_FL_CONTRACT_ADR

type SubmitOfferModalProps = {
  isOpen: boolean
  onClose: () => void
}

// 1. 出价列表 - API

// 2. 监听日志，有新的日志拍卖，就前端直接更新列表 - 合约？

// 3. 出价正常 / 异常

const BidModal = ({ isOpen, onClose }: SubmitOfferModalProps) => {
  const [value, setValue] = useState('')
  const [list, setList] = useState<IBidInfo[]>([])

  const [availableNums, setAvailableNums] = useState<any>()

  const scrollRef = useRef(null)
  const [bidLoading, setBidLoading] = useState(false)

  const { address } = useStore()

  const isLowPrice = useMemo(
    () => list.some((k) => Number(value) <= Number(k.amount)),
    [list, value],
  )

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

    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)

    try {
      setBidLoading(true)

      const data = await contract.bidLand(ethers.utils.parseEther(value), {
        gasLimit: BigInt(500000),
      })

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
      console.log(error, '<===')
    }
  }

  const getAvailableFL = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()

    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)

    const address = await signer.getAddress()

    if (!address) return toastError('Please connect wallet first.')

    try {
      const tx = await contract.getBidderInfoOf(address)
      setAvailableNums(ethers.utils.formatEther(tx.sysTokenBalance.toString()))
    } catch (error) {
      console.log(error, '<====getAvailableFL')
    }
  }

  const registerUpdateSOL = async () => {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI, signer)

    // TODO: 考虑到后续服务端压力，比如 Ddos，需要从合约侧返回的新数据去组装列表

    contract.on('NewBids', (Bidder, amount, bidId) => {
      console.log(
        Bidder,
        amount.toString(),
        bidId.toString(),
        'Bidder, amount, bidId',
      )
      getBidList().then(() => setBidLoading(false))
    })
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
      variant="bidModal"
      size="2xl"
      isOpen={isOpen}
      title={
        <Heading fontSize="22px" lineHeight="32px" textAlign="left">
          Bid on this Plot of FROMO
        </Heading>
      }
      onClose={onClose}
      bgColor={useColorModeValue ? '#fff' : '#fff'}>
      <VStack align="left">
        <Text
          fontSize="14px"
          lineHeight="20px"
          color="rgba(0, 0, 0, 0.7)"
          mb="40px">
          The highest bidder will have the opportunity to auction their NFT in
          the next round.
        </Text>
        <Box>
          <Flex p="10px 20px">
            <Text
              w="178px"
              align="left"
              mr="82px"
              fontSize="13px"
              color="rgba(0, 0, 0, 0.6)">
              BIDDER
            </Text>
            <Text fontSize="13px" color="rgba(0, 0, 0, 0.6)">
              BID
            </Text>
          </Flex>
          <Box
            overflowY="auto"
            height={bidList.length === 0 ? 0 : '220px'}
            ref={scrollRef}>
            {bidList.map((item, v) => (
              <Flex
                key={item.userAddress}
                p="10px 20px"
                border="1px solid #F2F2F2"
                borderRadius="10px"
                align="center"
                mb="10px">
                <Flex align="center" w="200px" mr="60px">
                  <Image
                    mr="10px"
                    borderRadius="37px"
                    border="1px solid #F2F2F2"
                    src="/static/account/sidebar/avatar.svg"
                    alt="avatar"
                    w="37px"
                    h="37px"></Image>
                  <Box fontSize="16px" w="160px">
                    {ellipseAddress(item.userAddress, 6)}
                  </Box>
                </Flex>
                <Text
                  align="left"
                  flex={1}
                  fontSize="16px"
                  color="rgb(0, 0, 0)">
                  {parseFloat(`${item.amount}`).toFixed(4)} $OMO Token
                </Text>
                {item.userAddress === address && (
                  <Text fontSize="14px" color="#7E4AF1" w="30px">
                    ME
                  </Text>
                )}
              </Flex>
            ))}
          </Box>
        </Box>
        <Flex align="baseline">
          <Box mr="14px">
            <Flex
              w="264px"
              p="16px"
              borderRadius="10px"
              alignItems="center"
              bg="#F4F4F4">
              <Text>Bid:</Text>
              <Input
                _focusVisible={{
                  borderWidth: '0px',
                }}
                type="number"
                fontWeight={700}
                fontSize="20px"
                border="none"
                onChange={(e) => setValue(e.target.value)}
              />
              <Text color="#333" fontSize="14px" lineHeight="24px">
                $OMO
              </Text>
            </Flex>
          </Box>
          <Button
            w="298px"
            borderRadius="10px"
            fontSize="20px"
            fontWeight="700"
            h="66px"
            color="#fff"
            bg="#704BEA"
            _hover={{ bg: '#704BEA' }}
            onClick={handleBid}
            disabled={availableNums <= 0 || bidLoading}
            isLoading={bidLoading}>
            Bid
          </Button>
        </Flex>
        <Text mt="8px" fontSize="12px" lineHeight="18px" color="#4F4F4F">
          Available：{formatNumberWithCommas(availableNums)} $OMO Token
        </Text>
        <Flex bg="#F6BF324D" p="15px" borderRadius="8px" mt="24px">
          <Image
            src="/static/common/info.svg"
            alt="info"
            w="16px"
            h="16px"
            mr="10px"
          />
          <Text
            textAlign="justify"
            color="#000"
            fontSize="14px"
            lineHeight="21px"
            mt="-5px">
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
