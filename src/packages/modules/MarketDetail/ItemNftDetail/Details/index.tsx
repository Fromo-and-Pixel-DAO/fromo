import { useEffect } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import {
  Box,
  Collapse,
  Flex,
  Image,
  Link,
  Text,
  useClipboard,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react'
import { getPublicEtherscanUrl } from 'packages/lib/utilities'

import { ellipseAddress } from '@utils'
import { toastSuccess } from '@utils/toast'

import { MetadataDetail } from './type'

export default function Details({ details }: { details?: MetadataDetail }) {
  const { onCopy, setValue } = useClipboard('')
  const { isOpen, onToggle } = useDisclosure()
  const [isLargerThan500] = useMediaQuery('(max-width: 500px)')
  const textColor = useColorModeValue('#FFA8FE', 'rgba(255,255,255,0.6)')
  const borderColor = useColorModeValue('#FFA8FE', 'rgba(255,255,255,0.2)')
  const bgColor = useColorModeValue(
    'rgba(255, 168, 254, 0.2)',
    'rgba(65, 65, 65, 0.3)',
  )
  const iconCopy = useColorModeValue(
    './static/market/iconCopy.svg',
    './static/market/iconCopyDarkMode.svg',
  )

  const toast = useToast()

  const data = [
    {
      title: 'Contract Address',
      data: (
        <Link
          mt="5px"
          fontWeight="400"
          textColor="white"
          fontSize={{ base: '14px' }}
          color="#000"
          href={getPublicEtherscanUrl(details?.contractAddress)}
          isExternal>
          {ellipseAddress(details?.contractAddress, isLargerThan500 ? 5 : 10)}
        </Link>
      ),
    },
    {
      title: 'Token ID',
      data: details?.tokenId,
    },
    {
      title: 'Token Standard',
      data: details?.tokenStandard,
    },
    {
      title: 'Blockchain',
      data: details?.blockChain,
    },
    {
      title: 'Metadata',
      data: details?.metadata,
    },
  ]

  useEffect(() => {
    setValue(details?.contractAddress)
  }, [details?.contractAddress, setValue])

  return (
    <Box
      mt={{ base: '32px', md: 'unset' }}
      blur={{ base: '5px', md: 'unset' }}
      border={{ base: '2px solid', md: 'none' }}
      borderColor={{ base: borderColor, md: 'none' }}
      borderRadius="10px"
      bg={{ base: bgColor, md: 'none' }}>
      <Flex
        px={{ base: '12px', md: 'unset' }}
        borderBottom={{ base: !isOpen ? '1px solid' : '', md: 'none' }}
        borderColor={{ base: borderColor, md: 'none' }}
        justifyContent="space-between"
        alignItems="center"
        onClick={onToggle}
        cursor="pointer"
        _hover={{ opacity: '0.7' }}
        h="40px"
        _focusVisible={{ border: 'none', boxShadow: 'none', bgColor: 'none' }}>
        <Flex align="center" gap="12px">
          <Text
            fontSize={{ base: '16px', md: '16px', lg: '20px' }}
            lineHeight="23px"
            fontWeight="900">
            Details
          </Text>
        </Flex>
        {!isOpen ? (
          <ChevronUpIcon w={5} h={5} />
        ) : (
          <ChevronDownIcon w={5} h={5} />
        )}
      </Flex>
      <Collapse in={!isOpen} animateOpacity>
        <Box pt="12px">
          {data.map((item, idx) => {
            if (item.title === 'Contract Address') {
              return (
                <Flex
                  px={isLargerThan500 ? '12px' : 'none'}
                  pb="8px"
                  key={idx}
                  justify={{ base: 'space-between' }}>
                  <Text
                    color={textColor}
                    fontSize={{ base: '14px' }}
                    lineHeight="16px"
                    fontWeight="400">
                    {item.title}
                  </Text>
                  <Flex gridGap="8px">
                    <Text
                      color="#FFFFFF"
                      fontSize={{ base: '14px' }}
                      lineHeight="16px"
                      fontWeight="400">
                      {item.data}
                    </Text>
                    <Image
                      onClick={() => {
                        onCopy()
                        toastSuccess('Copied')
                      }}
                      cursor="pointer"
                      alt=""
                      src={iconCopy}
                    />
                  </Flex>
                </Flex>
              )
            }
            return (
              <Flex
                px={isLargerThan500 ? '12px' : 'none'}
                pb="8px"
                key={idx}
                justify="space-between">
                <Text
                  color={textColor}
                  fontSize="14px"
                  lineHeight="16px"
                  fontWeight="400">
                  {item.title}
                </Text>
                <Text
                  color="#FFFFFF"
                  fontSize="14px"
                  lineHeight="16px"
                  fontWeight="400">
                  {item.data}
                </Text>
              </Flex>
            )
          })}
        </Box>
      </Collapse>
    </Box>
  )
}
