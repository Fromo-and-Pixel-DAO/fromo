import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { TriangleUpIcon } from '@chakra-ui/icons'
import {
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

function ItemGrid({
  item,
  gridName,
  isOngoingList = false,
  isUpcoming = false,
}: {
  item: any
  gridName?: string
  isOngoingList?: boolean
  isUpcoming?: boolean
}) {
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
      const timeString = `${time.hours > 0 ? `${time.hours}:` : ''}${
        time.minutes
      }:${time.seconds} `
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

  const RenderCountSecondary = ({
    isCenter = false,
  }: {
    isCenter?: boolean
  }) => {
    const formattedTime = useMemo(() => {
      const timeString = `${time.hours > 0 ? `${time.hours}:` : ''}${
        time.minutes
      }:${time.seconds} `
      return `${timeString}`.trim()
    }, [])

    if (item.status === State.Upcoming) {
      return (
        <Box color="rgba(255,255,255,0.6)" fontWeight="600" fontSize="12px">
          <Text textAlign={isCenter ? 'center' : 'start'}>Start in</Text>
          <Box fontSize="28px" fontWeight="800" color="#1DFED6">
            {formattedTime}
          </Box>
        </Box>
      )
    } else if (item.status === State.Ongoing) {
      return (
        <Box color="rgba(255,255,255,0.6)" fontWeight="600" fontSize="12px">
          <Text textAlign={isCenter ? 'center' : 'start'}>End in</Text>
          <Box fontSize="28px" fontWeight="800" color="#1DFED6">
            {formattedTime}
          </Box>
        </Box>
      )
    } else {
      return <Text textAlign={isCenter ? 'center' : 'start'}>Finished</Text>
    }
  }

  const bgColorStyle =
    item.status === State.Upcoming
      ? '#DA44FF'
      : item.status === State.Ongoing
      ? '#1DFED6'
      : 'rgba(255, 255, 255, 0.65)'

  if (pathname === PathnameType.MARKET && isOngoingList) {
    return (
      <Box
        bg="#6642B7"
        cursor="pointer"
        onClickCapture={() => {
          router.replace({
            pathname: `/${item.gameId}`,
            query: { nftName: item.name },
          })
        }}
        borderRadius="40px"
        p="16px"
        pr="25px">
        <Flex gap="20px">
          <Box
            w="180px"
            h="180px"
            borderRadius="28px"
            className="image-effect"
            pos="relative">
            <Image
              alt=""
              w="180px"
              h="180px"
              objectFit="cover"
              src={item.imageUrl}
              fallbackSrc="/static/license-template/template.png"
            />
            {gridName === 'finishedList' &&
              item?.lastAddress &&
              item?.lastAddress.toLocaleLowerCase() === address && (
                <Box
                  w="110px"
                  pos="absolute"
                  bg="#FFBD13"
                  top="0"
                  left="50%"
                  transform="translateX(-50%)"
                  py="8px"
                  zIndex={10}
                  fontWeight="800"
                  textAlign="center"
                  fontSize="14px"
                  color="#222222"
                  borderRadius="0 0 15px 15px">
                  YOU WON!
                </Box>
              )}
          </Box>

          <Flex direction="column" justifyContent="space-between">
            <Box>
              <Text
                fontSize="24px"
                lineHeight="28px"
                fontWeight="800"
                mb="20px">
                {item.name || '--'}
              </Text>
            </Box>
            <Flex gap="16px">
              <Box w="50%">
                <Text
                  fontSize="12px"
                  fontWeight="600"
                  whiteSpace="nowrap"
                  color="rgba(255,255,255,0.6)"
                  mb="4px">
                  Total Mint Fee
                </Text>
                <Flex alignItems="center" gap="4px">
                  <Image
                    src="/static/common/eth-index.svg"
                    alt="ethereum"
                    w="14px"
                    h="24px"
                  />
                  <Box
                    fontWeight="600"
                    fontSize="20px"
                    lineHeight="24px"
                    color="#1DFED6">
                    {item.status === 0
                      ? '--'
                      : parseFloat(item?.totalMintFee).toFixed(4) || '--'}
                  </Box>
                </Flex>
              </Box>
              <Box w="50%">
                <Text
                  fontSize="12px"
                  fontWeight="600"
                  whiteSpace="nowrap"
                  color="rgba(255,255,255,0.6)"
                  mb="4px">
                  Final Winner Prize
                </Text>
                <Flex alignItems="center" gap="4px">
                  <Image
                    src="/static/common/eth-index.svg"
                    alt="ethereum"
                    w="14px"
                    h="24px"
                  />
                  <Box
                    fontWeight="600"
                    fontSize="20px"
                    lineHeight="24px"
                    color="#1DFED6">
                    {item.status === 0
                      ? '--'
                      : parseFloat(
                          ethers.utils.formatEther(item?.finalPrice),
                        ).toFixed(4) || '--'}
                  </Box>
                </Flex>
              </Box>
            </Flex>
            <Flex justifyContent="space-between" alignItems="end">
              {localTimeFormatted && <RenderCountSecondary />}
              <Flex
                w="75px"
                h="36px"
                alignItems="center"
                justifyContent="center"
                bg="white"
                borderRadius="full">
                <Image
                  src="/static/common/players-ongoing.svg"
                  alt=""
                  w="20px"
                  h="20px"
                />
                <Box>
                  {gridName !== 'upcomingList' && (
                    <Box color="#7E4AF1" fontWeight="600" lineHeight="20px">
                      {item.biddersCount !== null &&
                      item.biddersCount !== undefined
                        ? item.biddersCount
                        : '--'}{' '}
                    </Box>
                  )}
                </Box>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    )
  }

  if (pathname === PathnameType.MARKET && isUpcoming) {
    return (
      <Box
        cursor="pointer"
        onClickCapture={() => {
          router.replace({
            pathname: `/${item.gameId}`,
            query: { nftName: item.name },
          })
        }}
        borderRadius="40px"
        p="16px"
        bg="#2F2B50"
        position="relative">
        {gridName === 'finishedList' &&
          item?.lastAddress &&
          item?.lastAddress.toLocaleLowerCase() === address && (
            <Box
              w="110px"
              pos="absolute"
              bg="#FFBD13"
              top="0"
              left="50%"
              transform="translateX(-50%)"
              py="8px"
              zIndex={10}
              fontWeight="800"
              textAlign="center"
              fontSize="14px"
              color="#222222"
              borderRadius="0 0 15px 15px">
              YOU WON!
            </Box>
          )}
        <Flex
          gap="20px"
          direction="column"
          justifyContent="center"
          alignItems="center">
          <Box borderRadius="28px" className="image-effect" pos="relative">
            <Image
              alt=""
              w="180px"
              h="180px"
              objectFit="cover"
              src={item.imageUrl}
              fallbackSrc="/static/license-template/template.png"
            />
          </Box>
          <Text
            fontSize="24px"
            fontWeight="600"
            lineHeight="20px"
            whiteSpace="nowrap"
            overflow="auto"
            textOverflow="ellipsis">
            {item.name || '--'}
          </Text>

          <RenderCountSecondary isCenter />
        </Flex>
      </Box>
    )
  }

  if (pathname === PathnameType.MARKET) {
    return (
      <Box
        cursor="pointer"
        onClickCapture={() => {
          router.replace({
            pathname: `/${item.gameId}`,
            query: { nftName: item.name },
          })
        }}
        borderRadius="40px"
        p="16px"
        bg="#2F2B50"
        position="relative">
        <>
          {gridName === 'finishedList' &&
            item?.lastAddress &&
            item?.lastAddress.toLocaleLowerCase() === address && (
              <Box
                w="110px"
                pos="absolute"
                bg="#FFBD13"
                top="0"
                left="50%"
                transform="translateX(-50%)"
                py="8px"
                zIndex={10}
                fontWeight="800"
                textAlign="center"
                fontSize="14px"
                color="#222222"
                borderRadius="0 0 15px 15px">
                YOU WON!
              </Box>
            )}
          <Box borderRadius="28px" className="image-effect" pos="relative">
            <Image
              alt=""
              w="180px"
              h="180px"
              objectFit="cover"
              src={item.imageUrl}
              fallbackSrc="/static/license-template/template.png"
            />

            {localTimeFormatted && (
              <Flex
                p="6px 12px"
                borderRadius="20px"
                position="absolute"
                w="84%"
                bottom="8px"
                left="50%"
                transform="translate(-50%)"
                justifyContent="center"
                bgColor={bgColorStyle}>
                <Text fontSize="14px" fontWeight="600" color="#222222">
                  <RenderCount />
                </Text>
              </Flex>
            )}
          </Box>
        </>
        <Box mt="16px">
          <Flex
            alignItems="center"
            justifyContent="space-between"
            gap="12px"
            align="center"
            mb="20px">
            <Text
              fontWeight="600"
              lineHeight="20px"
              whiteSpace="nowrap"
              overflow="auto"
              textOverflow="ellipsis">
              {item.name || '--'}
            </Text>
            {gridName !== 'upcomingList' && (
              <Flex alignItems="center" gap="2px">
                <Image
                  src="/static/common/players.svg"
                  alt=""
                  w="20px"
                  h="20px"
                />
                <Text
                  color="rgba(255,255,255,0.5)"
                  fontWeight="600"
                  whiteSpace="nowrap"
                  overflow="auto"
                  textOverflow="ellipsis"
                  lineHeight="20px">
                  {item.biddersCount !== null && item.biddersCount !== undefined
                    ? item.biddersCount
                    : '--'}{' '}
                </Text>
              </Flex>
            )}
          </Flex>
          <Flex gap="16px">
            <Box w="50%">
              <Text
                fontSize="12px"
                fontWeight="600"
                whiteSpace="nowrap"
                color="rgba(255,255,255,0.6)"
                mb="4px">
                Total Mint Fee
              </Text>
              <Flex alignItems="center" gap="4px">
                <Image
                  src="/static/common/eth-index.svg"
                  alt="ethereum"
                  w="14px"
                  h="24px"
                />
                <Box
                  fontWeight="600"
                  fontSize="20px"
                  lineHeight="24px"
                  color="#1DFED6">
                  {item.status === 0
                    ? '--'
                    : parseFloat(item?.totalMintFee).toFixed(4) || '--'}
                </Box>
              </Flex>
            </Box>
            <Box w="50%">
              <Text
                fontSize="12px"
                fontWeight="600"
                whiteSpace="nowrap"
                color="rgba(255,255,255,0.6)"
                mb="4px">
                Final Winner Prize
              </Text>
              <Flex alignItems="center" gap="4px">
                <Image
                  src="/static/common/eth-index.svg"
                  alt="ethereum"
                  w="14px"
                  h="24px"
                />
                <Box
                  fontWeight="600"
                  fontSize="20px"
                  lineHeight="24px"
                  color="#1DFED6">
                  {item.status === 0
                    ? '--'
                    : parseFloat(
                        ethers.utils.formatEther(item?.finalPrice),
                      ).toFixed(4) || '--'}
                </Box>
              </Flex>
            </Box>
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
        router.replace({
          pathname: `/${item.gameId}`,
          query: { nftName: item.name },
        })
      }}
      borderRadius="40px"
      p="16px"
      bg="#2F2B50"
      position="relative">
      <Box borderRadius="28px" className="image-effect" pos="relative">
        {item?.lastAddress &&
          item?.lastAddress.toLocaleLowerCase() === address && (
            <Box
              w="110px"
              pos="absolute"
              bg="#FFBD13"
              top="0"
              left="50%"
              transform="translateX(-50%)"
              py="8px"
              zIndex={10}
              fontWeight="800"
              textAlign="center"
              fontSize="14px"
              color="#222222"
              borderRadius="0 0 15px 15px">
              YOU WON!
            </Box>
          )}
        <Image
          alt=""
          w="180px"
          h="180px"
          objectFit="cover"
          src={item.imageUrl}
          fallbackSrc="/static/license-template/template.png"
        />

        {localTimeFormatted && (
          <Flex
            p="6px 12px"
            borderRadius="20px"
            position="absolute"
            w="84%"
            bottom="8px"
            left="50%"
            transform="translate(-50%)"
            justifyContent="center"
            bgColor={bgColorStyle}>
            <Text fontSize="14px" fontWeight="600" color="#222222">
              <RenderCount />
            </Text>
          </Flex>
        )}
      </Box>

      <Box mt="16px">
        <Flex
          alignItems="center"
          justifyContent="space-between"
          gap="12px"
          align="center"
          mb="20px">
          <Text
            fontWeight="600"
            lineHeight="20px"
            whiteSpace="nowrap"
            overflow="auto"
            textOverflow="ellipsis">
            {item.name || '--'}
          </Text>
          {gridName !== 'upcomingList' && (
            <Flex alignItems="center" gap="2px">
              <Image
                src="/static/common/players.svg"
                alt=""
                w="20px"
                h="20px"
              />
              <Text
                color="rgba(255,255,255,0.5)"
                fontWeight="600"
                whiteSpace="nowrap"
                overflow="auto"
                textOverflow="ellipsis"
                lineHeight="20px">
                {item.biddersCount !== null && item.biddersCount !== undefined
                  ? item.biddersCount
                  : '--'}{' '}
              </Text>
            </Flex>
          )}
        </Flex>
        <Flex gap="16px">
          <Box w="50%">
            <Text
              fontSize="12px"
              fontWeight="600"
              whiteSpace="nowrap"
              color="rgba(255,255,255,0.6)"
              mb="4px">
              Total Mint Fee
            </Text>
            <Flex alignItems="center" gap="4px">
              <Image
                src="/static/common/eth-index.svg"
                alt="ethereum"
                w="14px"
                h="24px"
              />
              <Box
                fontWeight="600"
                fontSize="20px"
                lineHeight="24px"
                color="#1DFED6">
                {item.status === 0 ? '--' : item?.totalKeyMinted || '--'}
              </Box>
            </Flex>
          </Box>
          <Box w="50%">
            <Text
              fontSize="12px"
              fontWeight="600"
              whiteSpace="nowrap"
              color="rgba(255,255,255,0.6)"
              mb="4px">
              Final Winner Prize
            </Text>
            <Flex alignItems="center" gap="4px">
              <Image
                src="/static/common/eth-index.svg"
                alt="ethereum"
                w="14px"
                h="24px"
              />
              <Box
                fontWeight="600"
                fontSize="20px"
                lineHeight="24px"
                color="#1DFED6">
                {item.status === 0 ? '--' : item?.finalPrice || '--'}
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default ItemGrid
