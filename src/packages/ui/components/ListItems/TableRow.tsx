import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  Image,
  Link,
  Td,
  Text,
  Tooltip,
  Tr,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import CreatePoolSuccessModal from '@modules/Modals/account/success/CreatePoolSuccessModal'
import StakeToPoolModal from '@modules/Modals/account/unlicensedNFT/StakeToPoolModal'
import WaitingCreatePublicPoolModal from '@modules/Modals/account/WaitingCreatePublicPoolModal'
import ApproveLicenseContractModal from '@modules/Modals/ApproveLicenseContractModal'
import useStore from 'packages/store'
import {
  checkIfThisPoolHasBeenApprovedFunc,
  createPublicPoolFunc,
} from 'packages/web3'

import { useWindowSize } from '@hooks/useWindowSize'

import { getTitleErrorMetamask } from '@utils'
import { convertUrlImage, ellipseAddress, weiToEtherString } from '@utils'
import { toastError } from '@utils/toast'

import { MyNFTsTabs, PathnameType } from '@ts'

import TableBuyAll from './TableBuyAll'

function Table({ item }: { item: any }) {
  const { width } = useWindowSize()
  const textColor = useColorModeValue('#fff', '#fff')
  const borderBottomColor = useColorModeValue('#704BEA4D', '#704BEA4D')
  const { address, setPoolAdress } = useStore()
  const [hasBeenApproved, setHasBeenApproved] = useState<boolean>(false)
  const {
    isOpen: isOpenApproveLicenseContractModal,
    onOpen: onOpenApproveLicenseContractModal,
    onClose: onCloseApproveLicenseContractModal,
  } = useDisclosure()
  const {
    isOpen: isOpenWaitingCreatePublicPoolModal,
    onOpen: onOpenWaitingCreatePublicPoolModal,
    onClose: onCloseWaitingCreatePublicPoolModal,
  } = useDisclosure()

  const {
    isOpen: isOpenCreatePoolSuccessModal,
    onOpen: onOpenCreatePoolSuccessModal,
    onClose: onCloseCreatePoolSuccessModal,
  } = useDisclosure()
  const router = useRouter()

  const { pathname, asPath } = router
  const {
    isOpen: isOpenStakeToPoolModal,
    onOpen: onOpenStakeToPoolModal,
    onClose: onCloseStakeToPoolModal,
  } = useDisclosure()

  const createPublicPool = useCallback(
    async (collectionAddress: string) => {
      try {
        onOpenWaitingCreatePublicPoolModal()
        const newPool = await createPublicPoolFunc(collectionAddress)
        const newPoolAddress = newPool?.events.slice(-1)[0]?.args?.poolAddress
        setPoolAdress(newPoolAddress)
        onCloseWaitingCreatePublicPoolModal()
        onOpenCreatePoolSuccessModal()
      } catch (error: any) {
        onCloseWaitingCreatePublicPoolModal()
        toastError(getTitleErrorMetamask(error))
      }
    },
    [
      onCloseWaitingCreatePublicPoolModal,
      onOpenCreatePoolSuccessModal,
      onOpenWaitingCreatePublicPoolModal,
      setPoolAdress,
    ],
  )

  const stakeBtnText = useMemo(() => {
    if (item?.poolAddress) {
      if (hasBeenApproved) {
        return 'Stake'
      }
      return 'Approve'
    }
    return 'Create public pool'
  }, [hasBeenApproved, item?.poolAddress])

  const createAndStakeToPublicPool = useCallback(async () => {
    try {
      if (item?.poolAddress) {
        if (hasBeenApproved) {
          return onOpenStakeToPoolModal()
        }
        return onOpenApproveLicenseContractModal()
      }
      return createPublicPool(item?.contractAddress)
    } catch (error) {
      console.log(error)
    }
  }, [
    createPublicPool,
    hasBeenApproved,
    item?.contractAddress,
    item?.poolAddress,
    onOpenApproveLicenseContractModal,
    onOpenStakeToPoolModal,
  ])

  const checkApproved = useCallback(async () => {
    try {
      if (!item?.contractAddress || !address || !item?.poolAddress) return
      const check = await checkIfThisPoolHasBeenApprovedFunc(
        item?.contractAddress,
        address,
        String(item?.poolAddress),
      )
      setHasBeenApproved(check)
    } catch (error) {
      console.log(error)
    }
  }, [address, item?.contractAddress, item?.poolAddress])

  useEffect(() => {
    checkApproved()
  }, [checkApproved])

  if (pathname === PathnameType.MARKET) {
    return (
      <>
        <Tr
          onClickCapture={() =>
            router.push(
              `/${item.derivativeContractAddress}?collection=${item.originalContractAddress}`,
            )
          }
          cursor="pointer"
          _hover={{ background: '#bab9b929' }}>
          <Td
            minW="210px"
            maxW="300px"
            lineHeight="16px"
            fontSize="14px"
            fontWeight="500"
            color={textColor}
            borderBottomColor={borderBottomColor}
            borderBottom="1px solid"
            borderColor="#E8E8E8"
            background="unset">
            <Flex alignItems="center">
              <Box borderRadius="4px" w="32px" h="32px" overflow="hidden">
                <Image
                  w="32px"
                  h="32px"
                  objectFit="cover"
                  alt=""
                  src={item.image}
                  fallbackSrc="/static/license-template/template.png"
                />
              </Box>
              <Text
                cursor="pointer"
                fontWeight="700"
                pl="8px"
                textOverflow="ellipsis"
                overflow="hidden"
                whiteSpace="nowrap">
                {item.name}
              </Text>
            </Flex>
          </Td>
          <Td
            lineHeight="16px"
            fontSize="14px"
            fontWeight="500"
            color={textColor}
            borderBottomColor={borderBottomColor}
            borderBottom="1px solid"
            borderColor="#E8E8E8">
            <Flex>
              <Text
                lineHeight="16px"
                fontSize="12px"
                fontWeight="500">
                {item.owner}
              </Text>
            </Flex>
          </Td>
          <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
            <Flex color="#00DAB3">
              <Text
                lineHeight="16px"
                fontSize="12px"
                fontWeight="500"
                textColor="#00DAB3">
                {weiToEtherString(item.currentHighestOffer)} ETH
              </Text>
            </Flex>
          </Td>

          <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
            <Flex alignItems="center" gridGap="6px">
              <Text lineHeight="16px" fontSize="14px" color={textColor}>
                {item.startTime}
              </Text>
            </Flex>
          </Td>
          <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
            <Flex alignItems="center" gridGap="6px">
              <Text lineHeight="16px" fontSize="14px" color={textColor}>
                {item.state}
              </Text>
            </Flex>
          </Td>
        </Tr>
      </>
    )
  }

  if (
    pathname === PathnameType.MY_NFT &&
    asPath.includes(MyNFTsTabs.UNLICENSED_NFT)
  ) {
    return (
      <>
        <Tr _hover={{ background: '#bab9b929' }}>
          <Td
            minW="210px"
            maxW="300px"
            lineHeight="16px"
            fontSize="14px"
            fontWeight="500"
            color={textColor}
            borderBottomColor={borderBottomColor}
            borderBottom="1px solid"
            borderColor="#E8E8E8"
            background="unset">
            <Flex alignItems="center">
              <Box
                borderRadius="4px"
                w="32px"
                h="32px"
                minW="32px"
                overflow="hidden">
                <Image
                  w="32px"
                  h="32px"
                  objectFit="cover"
                  alt=""
                  src={convertUrlImage(item?.image)}
                  fallbackSrc="/static/license-template/template.png"
                />
              </Box>
              <Text
                cursor="pointer"
                fontWeight="700"
                pl="8px"
                textOverflow="ellipsis"
                overflow="hidden"
                whiteSpace="nowrap">
                {item?.title}
              </Text>
            </Flex>
          </Td>
          <Td
            lineHeight="16px"
            fontSize="14px"
            fontWeight="500"
            color={textColor}
            borderBottomColor={borderBottomColor}
            borderBottom="1px solid"
            borderColor="#E8E8E8">
            <Link
              mt="5px"
              fontSize="14px"
              color={textColor}
              // href={getPublicEtherscanUrl(item.contractAddress)}
              isExternal>
              {ellipseAddress(item?.contractAddress, 4)}
            </Link>
          </Td>
          <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
            <Flex alignItems="center" gridGap="6px">
              <Text lineHeight="16px" fontSize="14px" color={textColor}>
                {item?.collectionDetails.floorPrice}
              </Text>
            </Flex>
          </Td>
          <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
            <Flex alignItems="center" gridGap="6px">
              <Text lineHeight="16px" fontSize="14px" color={textColor}>
                My Little Piggie
              </Text>
            </Flex>
          </Td>

          <Td
            py={0}
            isNumeric
            minW="100px"
            borderBottom="1px solid"
            borderBottomColor={borderBottomColor}>
            <Button
              onClick={createAndStakeToPublicPool}
              // isLoading={isLoading}
              _hover={{ opacity: 0.7 }}
              border="1px solid "
              borderColor="#704BEA"
              fontSize="12px"
              fontWeight="500"
              height="33px"
              variant="outline">
              {stakeBtnText}
            </Button>
          </Td>
        </Tr>
        <WaitingCreatePublicPoolModal
          isOpen={isOpenWaitingCreatePublicPoolModal}
          onClose={onCloseWaitingCreatePublicPoolModal}
        />
        <CreatePoolSuccessModal
          item={item}
          isOpen={isOpenCreatePoolSuccessModal}
          onClose={onCloseCreatePoolSuccessModal}
        />
        <StakeToPoolModal
          item={item}
          isOpen={isOpenStakeToPoolModal}
          onClose={onCloseStakeToPoolModal}
        />
        <ApproveLicenseContractModal
          item={item}
          isOpen={isOpenApproveLicenseContractModal}
          onClose={onCloseApproveLicenseContractModal}
        />
      </>
    )
  }
  if (
    pathname === PathnameType.MY_NFT &&
    asPath.includes(MyNFTsTabs.LICENSED_NFT)
  ) {
    return (
      <>
        <Tr _hover={{ background: '#bab9b929' }}>
          <Td
            minW="210px"
            maxW="300px"
            lineHeight="16px"
            fontSize="14px"
            fontWeight="500"
            color={textColor}
            borderBottomColor={borderBottomColor}
            borderBottom="1px solid"
            borderColor="#E8E8E8"
            background="unset">
            <Flex alignItems="center">
              <Box
                borderRadius="4px"
                w="32px"
                h="32px"
                overflow="hidden"
                minW="32px">
                <Image
                  w="32px"
                  h="32px"
                  objectFit="cover"
                  alt=""
                  src={item.image}
                  fallbackSrc="/static/license-template/template.png"
                />
              </Box>
              <Text
                cursor="pointer"
                fontWeight="700"
                pl="8px"
                maxW="120px"
                textOverflow="ellipsis"
                overflow="hidden"
                whiteSpace="nowrap">
                {item.title}
              </Text>
            </Flex>
          </Td>
          <Td
            lineHeight="16px"
            fontSize="14px"
            fontWeight="500"
            color={textColor}
            borderBottomColor={borderBottomColor}
            borderBottom="1px solid"
            borderColor="#E8E8E8">
            <Text
              cursor="pointer"
              fontWeight="500"
              pl="8px"
              fontSize="12px"
              textOverflow="ellipsis"
              overflow="hidden"
              whiteSpace="nowrap">
              My Little Piggie
            </Text>
          </Td>
          <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
            <Flex gridGap="6px" color="#00DAB3">
              <Text
                lineHeight="16px"
                fontSize="12px"
                fontWeight="500"
                textColor="#00DAB3">
                50 ETH
              </Text>
              <Image src="/static/modals/triangle_up.svg" alt="triangle_up" />
            </Flex>
          </Td>
          <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
            <Flex alignItems="center" gridGap="6px">
              <Text lineHeight="16px" fontSize="12px" color={textColor}>
                50
              </Text>
            </Flex>
          </Td>
          <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
            <Flex alignItems="center" gridGap="6px">
              <Text lineHeight="16px" fontSize="12px" color={textColor}>
                0.01 ETH
              </Text>
            </Flex>
          </Td>
          <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
            <Flex alignItems="center" gridGap="6px">
              <Text
                lineHeight="16px"
                fontSize="12px"
                fontWeight="500"
                textColor="#00DAB3">
                After 24 hours
              </Text>
            </Flex>
          </Td>

          <Td
            py={0}
            isNumeric
            minW="100px"
            borderBottom="1px solid"
            borderBottomColor={borderBottomColor}>
            <Button
              _hover={{ opacity: 0.7 }}
              border="1px solid "
              borderColor="#704BEA"
              fontSize="12px"
              fontWeight="500"
              height="33px"
              variant="outline">
              Unstake
            </Button>
          </Td>
        </Tr>
      </>
    )
  }

  if (pathname === PathnameType.BUY) {
    return (
      <>
        <TableBuyAll />
      </>
    )
  }

  if (pathname === PathnameType.SELL) {
    return (
      <Tr _hover={{ background: '#bab9b929' }}>
        <Td
          minW={`${width > 768 ? '210px' : '70px'}`}
          maxW="300px"
          lineHeight="16px"
          fontSize={`${width > 768 ? '14px' : '12px'}`}
          fontWeight="500"
          color={textColor}
          borderBottomColor={borderBottomColor}
          borderBottom="1px solid"
          borderColor="#E8E8E8"
          background="unset">
          <Flex alignItems="center">
            <Box borderRadius="4px" w="32px" h="32px" overflow="hidden">
              <Image
                w="32px"
                h="32px"
                objectFit="cover"
                alt=""
                src="/static/fake/detail.svg"
                fallbackSrc="/static/license-template/template.png"
              />
            </Box>
            {width > 768 ? (
              <Text
                cursor="pointer"
                fontWeight="700"
                pl="8px"
                textOverflow="ellipsis"
                overflow="hidden"
                whiteSpace="nowrap">
                My Little Piggie
              </Text>
            ) : (
              <Tooltip label="My Little Piggie" fontSize="sm">
                <InfoIcon marginLeft={3} />
              </Tooltip>
            )}
          </Flex>
        </Td>
        {width > 768 && (
          <Td
            lineHeight="16px"
            fontSize="14px"
            fontWeight="500"
            color={textColor}
            borderBottomColor={borderBottomColor}
            borderBottom="1px solid"
            borderColor="#E8E8E8">
            <Flex gridGap="6px" color="#00DAB3">
              <Text
                lineHeight="16px"
                fontSize="12px"
                fontWeight="500"
                textColor="#00DAB3">
                1,245
              </Text>
            </Flex>
          </Td>
        )}
        <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
          <Flex alignItems="center" gridGap="6px">
            <Text lineHeight="16px" fontSize="12px" color={textColor}>
              30 days
            </Text>
          </Flex>
        </Td>

        <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
          <Flex alignItems="center" gridGap="6px">
            <Text lineHeight="16px" fontSize="12px" color={textColor}>
              0.54 ETH
            </Text>
          </Flex>
        </Td>
        {width > 768 && (
          <>
            <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
              <Flex alignItems="center" gridGap="6px">
                <Text lineHeight="16px" fontSize="12px" color={textColor}>
                  0.54 ETH
                </Text>
              </Flex>
            </Td>
            <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
              <Flex alignItems="center" gridGap="6px">
                <Text lineHeight="16px" fontSize="12px" color={textColor}>
                  0.54 ETH
                </Text>
              </Flex>
            </Td>
          </>
        )}

        <Td
          fontSize="14px"
          color="#FFFFFF99"
          borderBottom="1px solid"
          borderBottomColor={borderBottomColor}>
          <Flex alignItems="center" gridGap="6px">
            <Text
              lineHeight="16px"
              fontSize="12px"
              fontWeight="400"
              textColor="#00DAB3">
              Transferred
            </Text>
          </Flex>
        </Td>
        <Td
          py={0}
          isNumeric
          minW="100px"
          borderBottom="1px solid"
          borderBottomColor={borderBottomColor}>
          <Button
            h="35px"
            border="1px solid"
            borderColor="#704BEA"
            textColor="#704BEA"
            fontSize="12px"
            fontWeight="500"
            bg="#2a0668">
            Cancel
          </Button>
        </Td>
      </Tr>
    )
  }

  if (pathname === PathnameType.MY_COLLECTION) {
    return (
      <Tr _hover={{ background: '#bab9b929' }}>
        <Td
          minW="210px"
          maxW="300px"
          lineHeight="16px"
          fontSize="14px"
          fontWeight="500"
          color={textColor}
          borderBottomColor={borderBottomColor}
          borderBottom="1px solid"
          borderColor="#E8E8E8"
          background="unset">
          <Flex alignItems="center">
            <Box borderRadius="4px" w="32px" h="32px" overflow="hidden">
              <Image
                w="32px"
                h="32px"
                objectFit="cover"
                alt=""
                src="/static/fake/detail.svg"
                fallbackSrc="/static/license-template/template.png"
              />
            </Box>
            <Text
              cursor="pointer"
              fontWeight="700"
              pl="8px"
              textOverflow="ellipsis"
              overflow="hidden"
              whiteSpace="nowrap">
              My Little Piggie
            </Text>
          </Flex>
        </Td>
        <Td
          lineHeight="16px"
          fontSize="14px"
          fontWeight="500"
          color={textColor}
          borderBottomColor={borderBottomColor}
          borderBottom="1px solid"
          borderColor="#E8E8E8">
          <Flex mr="95px" align="center" color="#00DAB3">
            <Box mr="6px" fontSize="12px" fontWeight="400">
              1,234
            </Box>
          </Flex>
        </Td>
        <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
          <Flex mr="95px" align="center" color="#00DAB3">
            <Box mr="6px" fontSize="12px" fontWeight="400">
              50 ETH
            </Box>
          </Flex>
        </Td>

        <Td
          pt={0}
          minW="100px"
          borderBottom="1px solid"
          borderBottomColor={borderBottomColor}>
          <Flex fontSize="12px">100</Flex>
        </Td>
      </Tr>
    )
  }
  return (
    <Tr cursor="pointer" _hover={{ background: '#bab9b929' }}>
      <Td
        minW="210px"
        maxW="300px"
        lineHeight="16px"
        fontSize="14px"
        fontWeight="500"
        color={textColor}
        borderBottomColor={borderBottomColor}
        borderBottom="1px solid"
        borderColor="#E8E8E8"
        background="unset">
        <Flex alignItems="center">
          <Box borderRadius="4px" w="32px" h="32px" overflow="hidden">
            <Image
              w="32px"
              h="32px"
              objectFit="cover"
              alt=""
              src="/static/fake/detail.svg"
              fallbackSrc="/static/license-template/template.png"
            />
          </Box>
          <Text
            cursor="pointer"
            fontWeight="700"
            pl="8px"
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap">
            My Little Piggie
          </Text>
        </Flex>
      </Td>
      <Td
        lineHeight="16px"
        fontSize="14px"
        fontWeight="500"
        color={textColor}
        borderBottomColor={borderBottomColor}
        borderBottom="1px solid"
        borderColor="#E8E8E8">
        <Link
          mt="5px"
          fontSize="14px"
          color={textColor}
          // href={getPublicEtherscanUrl(item.contractAddress)}
          isExternal>
          0x285cfd0e7ec...6e843483b7ac4
        </Link>
      </Td>
      <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
        <Flex alignItems="center" gridGap="6px">
          <Text lineHeight="16px" fontSize="14px" color={textColor}>
            10/20
          </Text>
        </Flex>
      </Td>

      <Td borderBottomColor={borderBottomColor} borderBottom="1px solid">
        <Flex alignItems="center" gridGap="6px">
          <Text lineHeight="16px" fontSize="14px" color={textColor}>
            10 ETH
          </Text>
        </Flex>
      </Td>

      <Td
        pt={0}
        isNumeric
        minW="100px"
        borderBottom="1px solid"
        borderBottomColor={borderBottomColor}>
        <Button border="1px solid #704BEA" variant="outline">
          Buy
        </Button>
      </Td>
    </Tr>
  )
}

export default Table
