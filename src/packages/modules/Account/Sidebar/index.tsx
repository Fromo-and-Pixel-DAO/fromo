import { useRef } from 'react'

import { useRouter } from 'next/router'

import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Image,
  Show,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import useStore from 'packages/store'

import { useWindowSize } from '@hooks/useWindowSize'

import { ellipseAddress } from '@utils'

import { PathnameType } from '@ts'

export default function Sidebar() {
  const { width } = useWindowSize()
  const router = useRouter()
  const { address } = useStore()
  const { pathname, asPath } = router

  const sidebarsSection1 = [
    {
      id: 0,
      title: 'My NFTs',
      href: '/account/my-nfts?tab=unlicensed-nft',
    },
    {
      id: 1,
      title: 'Buy Orders',
      href: '/account/buy',
    },
    {
      id: 2,
      title: 'Sell Orders',
      href: '/account/sell',
    },
    // {
    //   id: 3,
    //   title: 'My Collection',
    //   href: '/account/my-collection',
    // },
  ]

  const sidebarsMyNFTSubMenu = [
    {
      id: 0,
      title: 'NFTs',
      value: '12',
    },
    {
      id: 1,
      title: 'Collections',
      value: '12',
    },
  ]
  const sidebarsBuyOrderSubMenu = [
    {
      id: 0,
      value: 'All',
      number: '40',
    },
    {
      id: 1,
      value: 'Active',
      number: '12',
    },
    {
      id: 2,
      value: 'Expired',
      number: '28',
    },
    {
      id: 3,
      value: 'Offers made',
      number: '16',
    },
  ]
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()
  return (
    <>
      {width > 992 ? (
        <Box w="320px" borderRight="1px solid #704BEA80">
          <Flex
            align="center"
            gap="15px"
            borderBottom="1px solid #704BEA80"
            py="24px"
            justify="center"
            h="90px">
            <Image
              src="/static/account/sidebar/avatar.svg"
              w="50px"
              h="50px"
              alt="avatar"
            />
            <Box fontSize="20px" fontWeight="500">
              {ellipseAddress(address, 6)}
            </Box>
          </Flex>
          <Flex
            mt="30px"
            pb="30px"
            px="40px"
            flexDir="column"
            align="left"
            gap="20px"
            borderBottomWidth="1px"
            borderBottomColor="#704BEA80">
            {sidebarsSection1.map((item) => (
              <Box
                color={item.href.includes(pathname) ? '#fff' : '#FFFFFFCC'}
                opacity={item.href === pathname ? 1 : 0.7}
                fontWeight="bold"
                cursor="pointer"
                key={item.href}
                _hover={{ opacity: 0.7 }}
                onClick={() => router.push(`${item.href}`)}>
                {item.title}
              </Box>
            ))}
          </Flex>
          {pathname === PathnameType.MY_NFT && (
            <Flex
              mt="30px"
              pb="30px"
              px="40px"
              flexDir="column"
              gap="20px"
              borderBottomWidth="1px"
              borderBottomColor="#704BEA80">
              <Box>
                <Text fontSize="16px" fontWeight="700" textColor="#fff">
                  Types
                </Text>
              </Box>
              {sidebarsMyNFTSubMenu.map((item, idx) => (
                <Flex key={idx} justifyContent="left" gap="20px">
                  <Checkbox />
                  <Flex justifyContent="space-between" w="100%">
                    <Box
                      fontWeight="400"
                      fontSize="14px"
                      cursor="pointer"
                      textColor="rgba(255, 255, 255, 0.8)"
                      _hover={{ opacity: 0.7 }}>
                      {item.title}
                    </Box>
                    <Box
                      fontWeight="400"
                      fontSize="12px"
                      textColor="rgba(255, 255, 255, 0.8)">
                      {item.value}
                    </Box>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          )}
          {pathname === PathnameType.BUY && (
            <Flex
              mt="30px"
              pb="30px"
              px="40px"
              flexDir="column"
              gap="20px"
              borderBottomWidth="1px"
              borderBottomColor="#704BEA80">
              <Box>
                <Text fontSize="16px" fontWeight="700" textColor="#fff">
                  Types
                </Text>
              </Box>
              {sidebarsBuyOrderSubMenu.map((item, idx) => (
                <Flex key={idx} justifyContent="left" gap="20px">
                  <CheckboxGroup defaultValue={['All']}>
                    <Checkbox value={item.value} />
                  </CheckboxGroup>
                  <Flex justifyContent="space-between" w="100%">
                    <Box
                      fontWeight="400"
                      fontSize="14px"
                      cursor="pointer"
                      textColor="rgba(255, 255, 255, 0.8)"
                      _hover={{ opacity: 0.7 }}>
                      {item.value}
                    </Box>
                    <Text
                      fontWeight="400"
                      fontSize="12px"
                      textColor="rgba(255, 255, 255, 0.8)">
                      {item.number}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          )}
        </Box>
      ) : (
        <>
          <Show below="md">
            <Button
              ref={btnRef}
              color="#000"
              bgColor="#00DAB3"
              _active={{
                bg: 'transparent',
                border: '1px solid',
                borderColor: '#00DAB3',
                color: '#00DAB3',
              }}
              _hover={{
                bg: 'transparent',
                border: '1px solid',
                borderColor: '#00DAB3',
                color: '#00DAB3',
              }}
              position="absolute"
              top="82px"
              fontWeight="700"
              left="150px"
              textColor="#4e14a5"
              fontSize="14px"
              zIndex="5"
              h="30px"
              onClick={onOpen}>
              Menu
            </Button>
            <Drawer
              placement="left"
              onClose={onClose}
              isOpen={isOpen}
              finalFocusRef={btnRef}>
              <DrawerOverlay />
              <DrawerContent background="#2A1368" textColor="white">
                <DrawerCloseButton />
                <Box w="320px" borderRight="1px solid #704BEA80">
                  <Flex
                    align="center"
                    gap="15px"
                    borderBottom="1px solid #704BEA80"
                    py="24px"
                    justify="center"
                    h="90px">
                    <Image
                      src="/static/account/sidebar/avatar.svg"
                      w="50px"
                      h="50px"
                      alt="avatar"
                    />
                    <Box fontSize="20px" fontWeight="500">
                      {ellipseAddress(address, 6)}
                    </Box>
                  </Flex>
                  <Flex
                    mt="30px"
                    pb="30px"
                    px="40px"
                    flexDir="column"
                    align="left"
                    gap="20px"
                    borderBottomWidth="1px"
                    borderBottomColor="#704BEA80">
                    {sidebarsSection1.map((item) => (
                      <Box
                        color={
                          item.href.includes(pathname) ? '#fff' : '#FFFFFFCC'
                        }
                        opacity={item.href === pathname ? 1 : 0.7}
                        fontWeight="bold"
                        cursor="pointer"
                        key={item.href}
                        _hover={{ opacity: 0.7 }}
                        onClick={() => router.push(`${item.href}`)}>
                        {item.title}
                      </Box>
                    ))}
                  </Flex>
                  {pathname === PathnameType.MY_NFT && (
                    <Flex
                      mt="30px"
                      pb="30px"
                      px="40px"
                      flexDir="column"
                      gap="20px"
                      borderBottomWidth="1px"
                      borderBottomColor="#704BEA80">
                      <Box>
                        <Text fontSize="16px" fontWeight="700" textColor="#fff">
                          Types
                        </Text>
                      </Box>
                      {sidebarsMyNFTSubMenu.map((item, idx) => (
                        <Flex key={idx} justifyContent="left" gap="20px">
                          <Checkbox />
                          <Flex justifyContent="space-between" w="100%">
                            <Box
                              fontWeight="400"
                              fontSize="14px"
                              cursor="pointer"
                              textColor="rgba(255, 255, 255, 0.8)"
                              _hover={{ opacity: 0.7 }}>
                              {item.title}
                            </Box>
                            <Box
                              fontWeight="400"
                              fontSize="12px"
                              textColor="rgba(255, 255, 255, 0.8)">
                              {item.value}
                            </Box>
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                  {pathname === PathnameType.BUY && (
                    <Flex
                      mt="30px"
                      pb="30px"
                      px="40px"
                      flexDir="column"
                      gap="20px"
                      borderBottomWidth="1px"
                      borderBottomColor="#704BEA80">
                      <Box>
                        <Text fontSize="16px" fontWeight="700" textColor="#fff">
                          Types
                        </Text>
                      </Box>
                      {sidebarsBuyOrderSubMenu.map((item, idx) => (
                        <Flex key={idx} justifyContent="left" gap="20px">
                          <CheckboxGroup defaultValue={['All']}>
                            <Checkbox value={item.value} />
                          </CheckboxGroup>
                          <Flex justifyContent="space-between" w="100%">
                            <Box
                              fontWeight="400"
                              fontSize="14px"
                              cursor="pointer"
                              textColor="rgba(255, 255, 255, 0.8)"
                              _hover={{ opacity: 0.7 }}>
                              {item.value}
                            </Box>
                            <Text
                              fontWeight="400"
                              fontSize="12px"
                              textColor="rgba(255, 255, 255, 0.8)">
                              {item.number}
                            </Text>
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                </Box>
              </DrawerContent>
            </Drawer>
          </Show>
        </>
      )}
    </>
  )
}
