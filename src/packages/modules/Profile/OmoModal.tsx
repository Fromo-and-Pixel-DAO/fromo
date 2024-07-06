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
import { toastError, toastSuccess } from '@utils/toast'
import { ethers } from 'ethers'
import useStore from 'packages/store'
import {
  approveBidTokenFunc,
  depositBidTokenFunc,
  getBalanceOfFunc,
  withdrawBidTokenFunc,
} from 'packages/web3'
import { useEffect, useState } from 'react'

type SubmitOfferModalProps = {
  type: number
  omoAmount: string
  lockedOmoAmount: string
  withdrawalAmount: string
  isApproval: boolean
  isOpen: boolean
  onClose: () => void
}

const OmoModal = ({
  type,
  omoAmount,
  lockedOmoAmount,
  withdrawalAmount,
  isApproval,
  isOpen,
  onClose,
}: SubmitOfferModalProps) => {
  const [loading, setLoading] = useState(false)
  const { address, balance, setBalance } = useStore()
  const [amount, setAmount] = useState(null)
  const [useAmount, setUseAmount] = useState(0)
  const [approve, setApprove] = useState(false)
  const customVariant: 'redeemModal' | 'redeemModalMobile' =
    useBreakpointValue({
      base: 'redeemModalMobile',
      md: 'redeemModal',
    }) ?? 'redeemModal'

  const handleAmountChange = (type: number) => {
    setLoading(true)
    if (type === 1 && !approve) {
      approveBidTokenFunc()
        .then((res) => {
          if (res) {
            toastSuccess("You've successfully approved $OMO.")
            setApprove(true)
          } else {
            toastError('Failed to approve $OMO.')
          }
        })
        .catch((err) => {
          console.log(err)
          toastError('Failed to approve $OMO.')
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (type === 1 && approve) {
      depositBidTokenFunc(amount)
        .then((res) => {
          if (res) {
            toastSuccess(`You have successfully deposited $OMO.`)
            setUseAmount(amount)
            onClose()
          } else {
            toastError(`You failed to deposited $OMO due to some error.`)
          }
        })
        .catch((err) => {
          console.log(err)
          toastError(`You failed to deposited $OMO due to some error.`)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      withdrawBidTokenFunc(amount)
        .then((res) => {
          if (res) {
            toastSuccess(`You have successfully withdrew $OMO.`)
            setUseAmount(amount)
            onClose()
          } else {
            toastError(`You failed to withdrew $OMO due to some error.`)
          }
        })
        .catch((err) => {
          console.log(err)
          toastError(`You failed to withdrew $OMO due to some error.`)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  useEffect(() => {
    getBalanceOfFunc()
      .then((res) => {
        setBalance(Number(ethers.utils.formatEther(res)))
      })
      .catch((err) => {
        console.log(err)
      })
  }, [address, balance, setBalance])

  useEffect(() => {
    setApprove(isApproval)
  }, [isApproval])

  return (
    <BaseModal
      variant={customVariant}
      size={{ base: 'xs', md: 'md', xl: 'xl' }}
      isOpen={isOpen}
      isCloseBtn={false}
      title={
        <Heading
          textAlign="left"
          fontSize={{ base: '24px', xl: '28px' }}
          lineHeight="32px"
          color="white"
          fontWeight="800"
          mb={{ base: '12px', xl: '40px' }}>
          {type === 1 ? 'Deposit' : 'Withdraw'} $OMO
        </Heading>
      }
      buttons={
        <Button
          onClick={() => handleAmountChange(type)}
          isLoading={loading}
          m="auto"
          my={{ base: '12px', xl: '20px' }}
          w="100%"
          borderRadius="8px"
          fontSize={{ base: '16px', xl: '20px' }}
          fontWeight="700"
          h={{ base: '52px', xl: '66px' }}
          color="#222222"
          bg="#1DFED6"
          _hover={{ bg: '#1DFED6' }}>
          {type === 1 ? (approve ? 'Deposit' : 'Approve') : 'Withdraw'}
        </Button>
      }
      bgColor="#2F2B50">
      <VStack pos="relative" align="left">
        <Box
          onClick={() => {
            setUseAmount(0)
            onClose()
          }}
          p="16px"
          pos="absolute"
          top={{ base: '-96px', xl: '-128px' }}
          cursor="pointer"
          right={{ base: '-16px', md: '-28px' }}>
          <Image alt="" w="14px" h="14px" src="/static/common/close.svg" />
        </Box>
        <Box mb="12px">
          {type === 0 ? (
            <Flex alignItems="center" w="100%" mb="12px">
              <Flex fontSize="14px" color="rgba(255,255,255,0.8)">
                Locked to bid FROMO plot:
                <Text mx="4px" fontWeight="600">
                  {' '}
                  {lockedOmoAmount !== '-' &&
                    Number(ethers.utils.formatEther(lockedOmoAmount)).toFixed(
                      4,
                    )}{' '}
                  $OMO
                </Text>
              </Flex>
            </Flex>
          ) : null}
          <Flex alignItems="center" w="100%">
            {type === 0 ? (
              <Flex fontSize="14px" color="rgba(255,255,255,0.8)">
                Available:
                <Text mx="4px" fontWeight="600">
                  {' '}
                  {omoAmount !== '-' &&
                    Number(ethers.utils.formatEther(withdrawalAmount)) -
                      useAmount}{' '}
                  $OMO
                </Text>
              </Flex>
            ) : (
              <Text fontSize="14px" color="rgba(255,255,255,0.8)">
                Available: {balance - useAmount} $OMO
              </Text>
            )}
          </Flex>
        </Box>
        <Flex alignItems="center" w="100%" mb="20px">
          <Flex
            flex={1}
            p="16px 20px"
            borderRadius="10px"
            alignItems="center"
            bg="#0B063B">
            <Text color="rgba(255,255,255,0.6)">$OMO:</Text>
            <Input
              _focusVisible={{
                borderWidth: '0px',
              }}
              type="number"
              fontWeight={700}
              fontSize={{ base: '16px', xl: '20px' }}
              color="white"
              border="none"
              value={amount}
              max={balance - useAmount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Text
              onClick={() => {
                if (type === 1) {
                  setAmount((balance - useAmount).toString())
                } else {
                  setAmount(
                    Number(ethers.utils.formatEther(withdrawalAmount)) +
                      useAmount,
                  )
                }
              }}
              cursor="pointer"
              color="#1DFED6"
              fontSize={{ base: '16px', xl: '20px' }}
              lineHeight="24px"
              textTransform="uppercase"
              fontWeight="600">
              Max
            </Text>
          </Flex>
        </Flex>
      </VStack>
    </BaseModal>
  )
}

export default OmoModal
