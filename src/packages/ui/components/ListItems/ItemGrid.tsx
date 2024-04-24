import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { TriangleUpIcon } from '@chakra-ui/icons'
import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Image,
  Tag,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import ApproveLicenseContractModal from '@modules/Modals/ApproveLicenseContractModal'

import { ellipseAddress } from '@utils'

import { PathnameType } from '@ts'

import useCountDown from '@hooks/useCountDown'
import { State } from '@modules/Detail'
import { ethers } from 'ethers'
import moment from 'moment'
import useStore from 'packages/store'
import { myNFTUnlicensedData } from './FakeData'

function ItemGrid({ item, gridName }: { item: any; gridName?: string }) {
  const router = useRouter()
  const { pathname } = router
  const [isDetail, setIsGetDetail] = useState()
  const { address } = useStore()

  const {
    isOpen: isOpenApproveLicenseContractModal,
    onOpen: onOpenApproveLicenseContractModal,
    onClose: onCloseApproveLicenseContractModal,
  } = useDisclosure()

  const handleOpenDetailPool = (item: any) => {
    setIsGetDetail(item)
    onOpenApproveLicenseContractModal()
  }

  const localTimeFormatted = useMemo(() => {
    const date =
      item.status === State.Upcoming
        ? item?.['startTimestamp']
        : item?.['endTimestamp']
    if (!date) return null

    return moment(date).format('YYYY-MM-DD HH:mm:ss')
  }, [item])

  const time = useCountDown(localTimeFormatted)

  const RenderCount = () => {
    const formattedTime = useMemo(() => {
      const timeString = `${time.hours > 0 ? `${time.hours}hrs ` : ''}${
        time.minutes
      }mins ${time.seconds}secs`
      return `${timeString}`.trim()
    }, [])

    if (item.status === State.Upcoming) {
      return <span>Start in {formattedTime}</span>
    } else if (item.status === State.Ongoing) {
      return <span>End in {formattedTime}</span>
    } else {
      return <>Finished</>
    }
  }

  if (pathname === PathnameType.MARKET) {
    return (
      <Box
        cursor="pointer"
        onClickCapture={() => {
          router.push(`/${item.gameId}`)
        }}
        border="1px solid #704BEA"
        borderRadius="20px"
        p="10px"
        position="relative">
        <AspectRatio ratio={1 / 1}>
          <Box className="image-effect" overflow="hidden">
            <Image
              borderRadius="15px"
              alt=""
              src={item.imageUrl}
              fallbackSrc="/static/license-template/template.png"
            />
            {gridName === 'finishedList' &&
              item?.lastAddress &&
              item?.lastAddress.toLocaleLowerCase() === address && (
                <Box
                  pos="absolute"
                  bg="#7E4AF1"
                  left={0}
                  right={0}
                  bottom={0}
                  h="48px"
                  lineHeight="48px"
                  fontWeight="700"
                  textAlign="center"
                  fontSize="18px"
                  borderRadius="0 0 15px 15px">
                  YOU WON!
                </Box>
              )}
          </Box>
        </AspectRatio>
        {localTimeFormatted && (
          <Flex
            p="6px 12px"
            borderRadius="20px"
            position="absolute"
            top="16px"
            left="16px"
            bgColor={
              gridName === 'ongoingList'
                ? '#00DAB3'
                : 'rgba(255, 255, 255, 0.5)'
            }>
            <Text fontSize="12px" fontWeight={600} color="#2A0668">
              <RenderCount />
            </Text>
          </Flex>
        )}
        {gridName !== 'upcomingList' && (
          <Flex
            position="absolute"
            top="16px"
            right="16px"
            p="6px 12px"
            gap="4px"
            borderRadius="20px"
            bgColor="rgba(255, 255, 255, 0.5)">
            <Text fontSize="12px" color="#2A0668">
              {item.biddersCount !== null && item.biddersCount !== undefined
                ? item.biddersCount
                : '--'}{' '}
              Players
            </Text>
          </Flex>
        )}

        <Box m="16px 8px 0px 8px">
          <Flex justifyContent="space-between" align="center">
            <Box fontWeight="700" fontSize="14px" lineHeight="16px" m="0 0 6px">
              {item.name || '--'}
            </Box>
          </Flex>
          <Flex
            gap={{ base: '20px', md: '30px' }}
            w={{ base: '100%', lg: '100%' }}>
            <Flex flexDir="column">
              <Box
                w={{ lg: '100%' }}
                fontSize="12px"
                fontWeight="500"
                lineHeight="18px"
                color="#FFA8FE">
                Total Mint Fee
              </Box>
              <Box
                w={{ lg: '100%' }}
                lineHeight="20px"
                fontWeight={900}
                fontSize={{ base: '14px', md: '14px' }}
                color="#00DAB3">
                {item.status === 0
                  ? '--'
                  : parseFloat(item?.totalMintFee).toFixed(4) || '--'}{' '}
                ETH
              </Box>
            </Flex>
            <Flex flexDir="column">
              <Box
                w={{ lg: '100%' }}
                fontSize="12px"
                fontWeight="500"
                lineHeight="18px"
                color="#FFA8FE">
                Final Winner Prize
              </Box>
              <Box
                w={{ lg: '100%' }}
                lineHeight="20px"
                fontWeight={900}
                fontSize={{ base: '14px', md: '14px' }}
                color="#00DAB3">
                {item.status === 0
                  ? '--'
                  : parseFloat(
                      ethers.utils.formatEther(item?.finalPrice),
                    ).toFixed(4) || '--'}{' '}
                ETH
              </Box>
            </Flex>
          </Flex>
        </Box>
      </Box>
    )
  }

  if (pathname === PathnameType.MY_NFT) {
    return (
      <>
        {myNFTUnlicensedData.map((item, idx) => (
          <Box
            key={idx}
            border="1px solid #704BEA"
            borderRadius="20px"
            overflow="hidden"
            p="10px 10px 16px"
            position="relative">
            <Box className="image-effect">
              <Image borderRadius="15px" alt="" src={item.avatar} />
            </Box>
            <Box m="16px 8px 40px 8px">
              <Flex justifyContent="space-between" align="center">
                <Box fontWeight="700" fontSize="14px">
                  {item.name}
                </Box>
                <Image
                  cursor="pointer"
                  alt=""
                  src="./static/market/iconStar.svg"
                />
              </Flex>
              <Flex
                m="6px 0px"
                align="center"
                fontSize="12px"
                fontWeight="500"
                color="rgba(255,255,255,0.8)">
                <Box mr="4px">Public pool:</Box>
                <Box>{item.pool === undefined ? 'none' : item.pool}</Box>
              </Flex>
              <Flex
                m="6px 0px"
                align="center"
                fontSize="12px"
                fontWeight="500"
                color="rgba(255,255,255,0.8)">
                <Box mr="4px">Address:</Box>
                <Box>{ellipseAddress(item.address)}</Box>
              </Flex>
              <Flex fontSize="12px" fontWeight="500" align="center">
                <Box mr="6px">Value:</Box>
                <Flex>
                  <Box mr="4px">{item.value}</Box>
                  <Box color="rgba(255,255,255,0.6)">ETH</Box>
                </Flex>
              </Flex>
            </Box>
            <Button
              onClick={() => handleOpenDetailPool(item)}
              bgColor="#704BEA"
              color="#FFF"
              bottom="0"
              left="0"
              position="absolute"
              borderRadius="0px"
              _hover={{ opacity: 0.7 }}
              w="100%">
              Add to pool
            </Button>
            <ApproveLicenseContractModal
              isOpen={isOpenApproveLicenseContractModal}
              onClose={onCloseApproveLicenseContractModal}
              item={isDetail}
            />
          </Box>
        ))}
      </>
    )
  }

  if (pathname === PathnameType.BUY) {
    return (
      <Box
        cursor="pointer"
        border="1px solid #704BEA"
        borderRadius="20px"
        p="10px"
        position="relative">
        <Box className="image-effect">
          <Image borderRadius="15px" alt="" src="/static/fake/detail.svg" />
        </Box>
        <Box m="16px 8px 12px 8px">
          <Flex justifyContent="space-between" align="center">
            <Box fontWeight="700" fontSize="14px">
              My Little Piggie #4594
            </Box>
            <Image cursor="pointer" alt="" src="./static/market/iconStar.svg" />
          </Flex>

          <Flex
            m="10px 0px 20px"
            fontSize="14px"
            fontWeight="500"
            align="center">
            <Box mr="6px">Duration:</Box>
            <Tag size="sm" fontSize="12px" colorScheme="yellow" variant="solid">
              30 days
            </Tag>
          </Flex>
        </Box>
        <Flex justifyContent="space-between" gap="12px">
          <Button
            _hover={{ opacity: 0.7 }}
            borderRadius="4px"
            h="30px"
            bgColor="#704BEA"
            color="#FFF">
            <Text fontSize="14px">Modify offer</Text>
          </Button>
          <Button
            h="30px"
            _hover={{ opacity: 0.7 }}
            borderRadius="4px"
            bgColor="red.500"
            color="#FFF">
            <Text fontSize="14px">Delete</Text>
          </Button>
        </Flex>
      </Box>
    )
  }

  if (pathname === PathnameType.SELL) {
    return (
      <Box
        overflow="hidden"
        cursor="pointer"
        border="1px solid #704BEA"
        borderRadius="20px"
        p="10px 10px 16px"
        position="relative">
        <Box>
          <Box className="image-effect">
            <Image borderRadius="15px" alt="" src="/static/fake/detail.svg" />
          </Box>
          <Box m="16px 8px 40px 8px">
            <Flex justifyContent="space-between" align="center">
              <Box fontWeight="700" fontSize="14px">
                My Little Piggie #4594
              </Box>

              <Image
                cursor="pointer"
                alt=""
                src="./static/market/iconStar.svg"
              />
            </Flex>

            <Flex m="6px 0px" fontSize="12px" fontWeight="500" align="center">
              <Box mr="6px">Current highest bid:</Box>
              <Flex align="center" color="#00DAB3">
                <Box mr="6px">50 ETH</Box>
                <TriangleUpIcon />
              </Flex>
            </Flex>
            <Flex fontSize="12px" fontWeight="500" align="center">
              <Box mr="6px">Lock status:</Box>
              <Tag size="sm" fontSize="12px" colorScheme="red" variant="solid">
                unlock
              </Tag>
            </Flex>
          </Box>

          <Box bottom="0" left="0" position="absolute" w="100%">
            <Button
              _hover={{ opacity: 0.7 }}
              borderRadius="0px"
              bgColor="#704BEA"
              color="#FFF"
              w="100%">
              Out of the pool
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      cursor="pointer"
      onClickCapture={() => {
        router.push(`/${item.gameId}`)
      }}
      border="1px solid #704BEA"
      borderRadius="20px"
      p="10px"
      position="relative">
      <AspectRatio ratio={1 / 1}>
        <Box className="image-effect">
          <Image
            borderRadius="15px"
            alt=""
            src={item.imageUrl}
            fallbackSrc="/static/license-template/template.png"
          />
          {item?.lastAddress &&
            item?.lastAddress.toLocaleLowerCase() === address && (
              <Box
                pos="absolute"
                bg="#7E4AF1"
                left={0}
                right={0}
                bottom={0}
                h="48px"
                lineHeight="48px"
                fontWeight="700"
                textAlign="center"
                fontSize="18px"
                borderRadius="0 0 15px 15px">
                YOU WON!
              </Box>
            )}
        </Box>
      </AspectRatio>
      {localTimeFormatted && (
        <Flex
          p="6px 12px"
          borderRadius="20px"
          position="absolute"
          top="16px"
          left="16px"
          bgColor={
            gridName === 'ongoingList' ? '#00DAB3' : 'rgba(255, 255, 255, 0.5)'
          }>
          <Text fontSize="12px" fontWeight={600} color="#2A0668">
            <RenderCount />
          </Text>
        </Flex>
      )}

      {gridName !== 'upcomingList' && (
        <Flex
          position="absolute"
          top="16px"
          right="16px"
          p="6px 12px"
          gap="4px"
          borderRadius="20px"
          bgColor="rgba(255, 255, 255, 0.5)">
          <Text fontSize="12px" color="#2A0668">
            {item.biddersCount !== null && item.biddersCount !== undefined
              ? item.biddersCount
              : '--'}{' '}
            Players
          </Text>
        </Flex>
      )}

      <Box m="16px 8px 0px 8px">
        <Flex justifyContent="space-between" align="center">
          <Box fontWeight="700" fontSize="14px" lineHeight="16px" m="0 0 6px">
            {item.name}
          </Box>
          {/* <Image cursor="pointer" alt="" src="./static/market/iconStar.svg" /> */}
        </Flex>
        <Flex
          gap={{ base: '20px', md: '30px' }}
          w={{ base: '100%', lg: '100%' }}>
          <Flex flexDir="column">
            <Box
              w={{ lg: '100%' }}
              fontSize="12px"
              fontWeight="500"
              lineHeight="18px"
              color="#FFA8FE">
              Total Mint Fee
            </Box>
            <Box
              w={{ lg: '100%' }}
              textAlign="left"
              lineHeight="20px"
              fontWeight={900}
              fontSize={{ base: '14px', md: '14px' }}
              color="#00DAB3">
              {item.status === 0 ? '--' : item?.totalKeyMinted || '--'} ETH
            </Box>
          </Flex>
          <Flex flexDir="column">
            <Box
              w={{ lg: '100%' }}
              fontSize="12px"
              fontWeight="500"
              lineHeight="18px"
              color="#FFA8FE">
              Final Winner Prize
            </Box>
            <Box
              w={{ lg: '100%' }}
              textAlign="left"
              lineHeight="20px"
              fontWeight={900}
              fontSize={{ base: '14px', md: '14px' }}
              color="#00DAB3">
              {item.status === 0 ? '--' : item?.finalPrice || '--'} ETH
            </Box>
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}

export default ItemGrid
