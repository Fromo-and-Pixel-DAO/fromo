import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useColorModeValue,
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
      variant="redeemModal"
      size={{ base: 'xs', md: '2xl', xl: '2xl' }}
      isOpen={isOpen}
      title={
        <Heading
          textAlign="left"
          fontSize={{ base: '24px', xl: '28px' }}
          lineHeight="32px"
          color="white"
          fontWeight="800"
          mb="40px">
          Redeem Keys
        </Heading>
      }
      buttons={
        <Button
          onClick={redeemKeys}
          isLoading={loading}
          m="auto"
          my="20px"
          w="576px"
          borderRadius="10px"
          fontSize="20px"
          fontWeight="700"
          h="66px"
          color="#fff"
          bg="#704BEA"
          _hover={{ bg: '#704BEA' }}>
          Redeem
        </Button>
      }
      onClose={() => {
        if (loading) {
          return
        }
        onClose()
      }}
      bgColor="#2F2B50">
      <VStack align="left">
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
