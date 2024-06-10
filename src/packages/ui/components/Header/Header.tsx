import { FC, useCallback, useEffect, useReducer } from 'react'

import { providers } from 'ethers'
import { useRouter } from 'next/router'
import { getChainData } from 'packages/lib/utilities'
import useStore from 'packages/store'
import { initialState, reducer, web3Modal } from 'packages/web3'

import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Box,
  Collapse,
  Flex,
  IconButton,
  Image,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'

import { CustomConnectButton } from '@components/ConnectButton'
import { useAccount } from 'wagmi'

const NETWORK = 'sepolia_test'

interface NavItem {
  label: string
  subLabel?: string
  icon?: string
  iconDark?: string
  iconActive?: string
  children?: Array<NavItem>
  href?: string
  onToggleModal?: any
}

const NAV_ITEMS_CONNECTED: Array<NavItem> = [
  {
    label: 'NFT Whitelist',
    href: '/whitelist',
    icon: '/static/header/gallery.svg',
    iconDark: '/static/header/gallery_dark.svg',
  },
  {
    label: 'Auctions',
    href: '/',
    icon: '/static/header/gallery.svg',
    iconDark: '/static/header/gallery_dark.svg',
  },
  {
    label: 'NFT Pool',
    href: '/nftpool',
    icon: '/static/header/gallery.svg',
    iconDark: '/static/header/gallery_dark.svg',
  },
  {
    label: 'My Profile',
    href: '/profile',
    icon: '/static/header/account.svg',
    iconDark: '/static/header/account_dark.svg',
  },
]

const NAV_ITEMS_DISCONNECTED: Array<NavItem> = [
  {
    label: 'Market',
    href: '/',
    icon: '/static/header/gallery.svg',
    iconDark: '/static/header/gallery_dark.svg',
  },
]

const Header: FC = () => {
  const { setAddress } = useStore()
  const { isOpen, onToggle } = useDisclosure()
  const router = useRouter()
  const { pathname } = router

  const toast = useToast()

  const [state, dispatch] = useReducer(reducer, initialState)
  const { provider, web3Provider, address, chainId } = state

  const connect = useCallback(
    async function () {
      let provider = null
      try {
        provider = await web3Modal.connect()
        const web3Provider = new providers.Web3Provider(provider)

        const signer = web3Provider.getSigner()
        const address = await signer.getAddress()

        setAddress(address.toLowerCase())
        window.localStorage.setItem('isConnect', 'true')
        const network = await web3Provider.getNetwork()

        dispatch({
          type: 'SET_WEB3_PROVIDER',
          provider,
          web3Provider,
          address,
          chainId: network.chainId,
        })
      } catch (error) {
        console.log(error)
      }
    },
    [setAddress],
  )

  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider()
      if (provider?.disconnect && typeof provider.disconnect === 'function') {
        await provider.disconnect()
      }
      setAddress('')
      window.localStorage.setItem('isConnect', 'false')
      dispatch({
        type: 'RESET_WEB3_PROVIDER',
      })
      window.location.reload()
    },
    [provider, setAddress],
  )

  // Auto connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect()
    }
  }, [connect])

  useEffect(() => {
    const isConnect = window.localStorage.getItem('isConnect')

    if (isConnect === 'false' && pathname.includes('/account')) {
      router.push('/404')
    }
  }, [pathname, router])

  // A `provider` should come with EIP-1193 events. We'll listen for those events
  // here so that when a user switches accounts or networks, we can update the
  // local React state with that new information.
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        dispatch({
          type: 'SET_ADDRESS',
          address: accounts[0],
        })
        window.location.reload()
      }

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId: string) => {
        window.location.reload()
      }

      const handleDisconnect = (error: { code: number; message: string }) => {
        disconnect()
      }

      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', handleChainChanged)
      provider.on('disconnect', handleDisconnect)

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged)
          provider.removeListener('chainChanged', handleChainChanged)
          provider.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [provider, disconnect, address])

  useEffect(() => {
    try {
      if (chainId) {
        const chainData = getChainData(chainId)
        const validChain = address && chainData?.network === NETWORK
        if (!validChain) {
          toast({
            title: `Please switch to ${NETWORK} network.`,
            status: 'warning',
            duration: null,
            isClosable: false,
            position: 'top',
          })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }, [address, chainId, toast])

  return (
    <Box
      pos="fixed"
      top="0"
      left="0"
      w="100%"
      zIndex="100"
      backdropFilter="blur(2.7px)">
      <Flex
        mx="auto"
        color={useColorModeValue('gray.600', 'white')}
        py="18px"
        px={{ base: '20px', lg: '48px' }}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align="center"
        justifyContent="space-between">
        <Flex justify="center" h="28px" onClick={() => router.replace('/')}>
          <Image cursor="pointer" src="/static/common/logo.svg" alt="" />
        </Flex>
        <Flex alignItems="center" gap={{ base: '8px', md: '20px', xl: '40px' }}>
          <DesktopNav />
          <CustomConnectButton />
          <IconButton
            display={{ base: 'block', lg: 'none' }}
            onClick={onToggle}
            icon={<HamburgerIcon w={8} h={8} color="black" />}
            aria-label="Toggle Navigation"
          />
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav onToggleModal={onToggle} />
      </Collapse>
    </Box>
  )
}

export default Header

const DesktopNav = () => {
  const linkHoverColor = useColorModeValue('primary.100', 'primary.100')
  const router = useRouter()
  const { pathname } = router
  const bgColor = useColorModeValue('#fff', '#fff')
  const { isConnected } = useAccount()

  const NAV_ITEMS = isConnected ? NAV_ITEMS_CONNECTED : NAV_ITEMS_DISCONNECTED

  const isSubPath = (pathname: any, href: any) => {
    const regex = new RegExp(`^${href}(\/|$)`)
    return regex.test(pathname)
  }
  return (
    <Stack
      display={{ base: 'none', lg: 'flex' }}
      direction="row"
      spacing={3}
      align="center">
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger="hover" placement="bottom-start">
            <PopoverTrigger>
              <Box
                fontWeight={
                  isSubPath(pathname, navItem.href) ? 'semibold' : 'normal'
                }
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
                minW={navItem.label === 'My NFTs' ? '120px' : '120px'}
                textAlign="center"
                color={isSubPath(pathname, navItem.href) ? '#00DAB3' : 'white'}
                bg={isSubPath(pathname, navItem.href) ? '#2F2B50' : ''}
                padding="8px 16px"
                borderRadius="full"
                whiteSpace="nowrap">
                <Text
                  cursor="pointer"
                  onClick={() => navItem.href && router.push(navItem.href)}>
                  {navItem.label}
                </Text>
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow="xl"
                p={4}
                rounded="xl"
                bg={bgColor}
                w="200px">
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, href }: NavItem) => {
  const router = useRouter()
  return (
    <Box
      onClick={() => href && router.push(href)}
      role="group"
      display="block"
      p={2}
      rounded="md"
      _hover={{ bg: useColorModeValue('gray.50', 'gray.50') }}
      cursor="pointer">
      <Stack direction="row" align="center">
        <Box>
          <Text
            transition="all .3s ease"
            textColor={useColorModeValue('#4A5568', '#4A5568')}
            _groupHover={{ color: useColorModeValue('gray.400', 'gray.400') }}
            fontWeight={500}>
            {label}
          </Text>
        </Box>
      </Stack>
    </Box>
  )
}

const MobileNav = ({ onToggleModal }: { onToggleModal: any }) => {
  const router = useRouter()
  const { isConnected } = useAccount()

  const NAV_ITEMS = isConnected ? NAV_ITEMS_CONNECTED : NAV_ITEMS_DISCONNECTED

  return (
    <Stack bg="black" p={4} display={{ lg: 'none' }} h="100vh">
      {NAV_ITEMS.map((i, k) => (
        <Flex
          key={k}
          bg="#2F2B50"
          borderRadius="8px"
          py="12px"
          px="16px"
          as={Link}
          onClick={() => {
            if (i.href) {
              router.push(i.href)
              onToggleModal()
            }
          }}
          justify={{ base: 'space-between', md: 'space-between' }}
          align="center"
          _hover={{
            textDecoration: 'none',
          }}>
          <Text fontWeight={900} color="#00DAB3">
            {i.label}
          </Text>
        </Flex>
      ))}
    </Stack>
  )
}
