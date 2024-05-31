import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react'

import BaseModal from '@components/Modal'
import { toastError, toastSuccess } from '@utils/toast'
import { convertKeyToToken } from 'packages/web3'
import { useState } from 'react'

type SubmitOfferModalProps = {
  unconvertedGameIds: number[]
  isOpen: boolean
  onClose: () => void
}

const RedeemModal = ({
  unconvertedGameIds,
  isOpen,
  onClose,
}: SubmitOfferModalProps) => {
  const [loading, setLoading] = useState(false)
  const customVariant: 'redeemModal' | 'redeemModalMobile' =
    useBreakpointValue({
      base: 'redeemModalMobile',
      md: 'redeemModal',
    }) ?? 'redeemModal'

  const redeemKeys = () => {
    setLoading(true)
    convertKeyToToken(unconvertedGameIds)
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
        setLoading(false)
      })
  }

  return (
    <BaseModal
      variant={customVariant}
      size={{ base: 'xs', md: '2xl', xl: '2xl' }}
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
          Redeem Keys
        </Heading>
      }
      buttons={
        <Button
          onClick={redeemKeys}
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
          _hover={{ bg: '#704BEA' }}>
          Redeem
        </Button>
      }
      bgColor="#2F2B50">
      <VStack pos="relative" align="left">
        <Box
          onClick={() => {
            onClose()
          }}
          p="16px"
          pos="absolute"
          top={{ base: '-96px', xl: '-128px' }}
          cursor="pointer"
          right={{ base: '-16px', md: '-28px' }}>
          <Image alt="" w="14px" h="14px" src="/static/common/close.svg" />
        </Box>
        <Flex direction={{ base: 'column', md: 'row' }} alignItems="center">
          <Box>
            <Flex
              w={{ md: '328px' }}
              p="12px 20px"
              borderRadius="10px"
              alignItems="center"
              color="white"
              bg="#0B063B">
              <Text>Keys:</Text>
              <Input
                _focusVisible={{
                  borderWidth: '0px',
                }}
                type="number"
                fontWeight={700}
                fontSize="20px"
                border="none"
                value={0}
              />
            </Flex>
            <Text
              mt="4px"
              fontSize="12px"
              lineHeight="18px"
              color="#4F4F4F"
              align="end">
              &nbsp;
            </Text>
          </Box>
          <Text
            color="white"
            position="relative"
            top="-12px"
            fontSize="14px"
            lineHeight="20px"
            m="0 12px">
            to
          </Text>
          <Box>
            <Input
              w="212px"
              h="57px"
              borderColor="#F2F2F2"
              readOnly
              textAlign="center"
              value="1 FLT"
              color="white"
            />
            <Text
              mt="8px"
              fontSize="12px"
              lineHeight="18px"
              color="white"
              align="center">
              1.532 Key=1 $FLT
            </Text>
          </Box>
        </Flex>
      </VStack>
    </BaseModal>
  )
}

export default RedeemModal
