import { FC, memo } from 'react'
import { useCallback, useEffect, useReducer } from 'react'

import { useRouter } from 'next/router'

import {
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  HamburgerIcon,
} from '@chakra-ui/icons'
import {
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react'
import { providers } from 'ethers'
import { getChainData } from 'packages/lib/utilities'
import useStore from 'packages/store'
import { initialState, reducer, web3Modal } from 'packages/web3'

import { ellipseAddress } from '@utils'

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

const NAV_ITEMS_CONNECTED_DESKTOP: Array<NavItem> = [
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

const NAV_ITEMS_CONNECTED_MOBILE: Array<NavItem> = [
  {
    label: 'Market',
    href: '/',
    icon: '/static/header/gallery.svg',
    iconDark: '/static/header/gallery_dark.svg',
  },
  // {
  //   label: 'My Account',
  //   icon: '/static/header/account.svg',
  //   iconDark: '/static/header/account_dark.svg',
  //   iconActive: '/static/header/account_active.svg',
  //   children: [
  //     {
  //       label: 'My NFTs',
  //       href: '/account/my-nfts?tab=unlicensed-nft',
  //     },
  //     {
  //       label: 'My Licenses',
  //       href: '/account?tab=buy&subTabBuy=all',
  //     },
  //     {
  //       label: 'My Offers',
  //       href: '/account?tab=sell&subTabSell=active',
  //     },
  //     // {
  //     //   label: 'My Collection',
  //     //   href: '/account?tab=sell&subTabSell=active',
  //     // },
  //   ],
  // },
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
  const bgWallet = useColorModeValue('#fff', '#000')
  const textWallet = useColorModeValue('#000', '#fff')
  const [isLargerThan960] = useMediaQuery('(min-width: 960px)')
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

  const bgColorDesktop = useColorModeValue(
    'rgba(112, 75, 234,0.2)',
    'rgba(1, 1, 1, 0.1)',
  )
  return (
    <Box
      pos="fixed"
      top="0"
      left="0"
      w="100%"
      zIndex="100"
      bgColor={bgColorDesktop}
      backdropFilter="blur(2.7px)">
      <Flex
        mx="auto"
        color={useColorModeValue('gray.600', 'white')}
        h="70px"
        px={{ base: '20px', lg: '40px' }}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align="center"
        justifyContent="space-between">
        <Flex
          justify="center"
          w={{ base: '138px', md: '200px' }}
          h="28px"
          onClick={() => router.replace('/')}>
          <Image cursor="pointer" src="/static/common/logo.svg" alt="" />
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify="flex-end"
          direction="row"
          spacing={6}
          align="center">
          <Flex display={{ base: 'none', lg: 'flex' }}>
            <DesktopNav />
          </Flex>

          <Box display={{ base: 'none', lg: 'flex' }}>
            {!web3Provider && isLargerThan960 ? (
              <Button
                fontSize="14px"
                border="1px solid white"
                bg={bgWallet}
                fontWeight={400}
                onClick={connect}
                borderRadius="full"
                className="connect-wallet-btn">
                Connect Wallet
              </Button>
            ) : (
              <Menu>
                <MenuButton
                  _hover={{
                    bg: 'unset',
                  }}
                  _active={{
                    bg: 'unset',
                  }}
                  bg="#391683"
                  color="#fff"
                  borderRadius="full"
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  fontSize="14px"
                  border="1px solid white">
                  {ellipseAddress(address)}
                </MenuButton>
                <MenuList bg="white" borderRadius="8px">
                  <MenuItem
                    bg="white"
                    color="black"
                    _hover={{ bgColor: 'gray.200' }}
                    _active={{ bgColor: 'gray.200' }}>
                    {ellipseAddress(address)}
                  </MenuItem>
                  <MenuItem
                    bg="white"
                    color="black"
                    _hover={{ bgColor: 'gray.200' }}
                    _active={{ bgColor: 'gray.200' }}
                    onClick={disconnect}>
                    Disconnect
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </Box>
        </Stack>
        <Flex
          display={{ base: 'flex', lg: 'none' }}
          gap="24px"
          justify="space-between"
          align="center">
          {/* {colorMode === 'light' ? (
            <MoonIcon
              cursor="pointer"
              color="yellow.400"
              onClick={toggleColorMode}
            />
          ) : (
            <SunIcon cursor="pointer" onClick={toggleColorMode} />
          )} */}
          {!web3Provider && !isLargerThan960 ? (
            <Flex
              display={{ base: 'flex', lg: 'none' }}
              bgColor="white"
              ml="12px"
              align="center"
              justify="center"
              borderRadius="full"
              w="40px"
              h="40px"
              // onClick={connect}
              className="connect-wallet-btn">
              <Menu>
                <MenuButton
                  bg={bgWallet}
                  color={textWallet}
                  borderRadius="full"
                  as={Box}
                  fontSize="14px"
                  border="1px solid white">
                  <Image
                    src="/static/header/wallet-icon.svg"
                    alt=""
                    objectFit="cover"
                  />
                </MenuButton>
                <MenuList borderRadius="8px">
                  <MenuItem onClick={connect}>Connect Wallet</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          ) : (
            <Flex
              display={{ base: 'flex', lg: 'none' }}
              bgColor="white"
              align="center"
              justify="center"
              borderRadius="full"
              ml="12px"
              w="40px"
              h="40px"
              // onClick={disconnect}
            >
              <Menu>
                <MenuButton
                  bg={bgWallet}
                  color={textWallet}
                  borderRadius="full"
                  as={Box}
                  fontSize="14px"
                  border="1px solid white">
                  <Image
                    src="/static/header/wallet-icon.svg"
                    alt=""
                    objectFit="cover"
                  />
                </MenuButton>
                <MenuList bg="white" borderRadius="8px">
                  <MenuItem
                    bg="white"
                    color="black"
                    _hover={{ bgColor: 'gray.200' }}
                    _active={{ bgColor: 'gray.200' }}>
                    {ellipseAddress(address)}
                  </MenuItem>
                  <MenuItem
                    bg="white"
                    color="black"
                    _hover={{ bgColor: 'gray.200' }}
                    _active={{ bgColor: 'gray.200' }}
                    onClick={disconnect}>
                    Disconnect
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          )}
          <IconButton
            minW={0}
            onClick={onToggle}
            icon={
              isOpen ? (
                <CloseIcon w={3} h={3} color="white" />
              ) : (
                <HamburgerIcon w={8} h={8} color="white" />
              )
            }
            variant="ghost"
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

export default memo(Header)

const DesktopNav = () => {
  const linkHoverColor = useColorModeValue('primary.100', 'primary.100')
  const router = useRouter()
  const { pathname } = router
  const { address } = useStore()
  const { colorMode, toggleColorMode } = useColorMode()
  const bgColor = useColorModeValue('#fff', '#fff')

  const NAV_ITEMS = address
    ? NAV_ITEMS_CONNECTED_DESKTOP
    : NAV_ITEMS_DISCONNECTED

  const isSubPath = (pathname, href) => {
    const regex = new RegExp(`^${href}(\/|$)`)
    return regex.test(pathname)
  }
  return (
    <Stack direction="row" spacing={4} align="center">
      {/* {colorMode === 'light' ? (
        <MoonIcon
          cursor="pointer"
          color="yellow.400"
          onClick={toggleColorMode}
        />
      ) : (
        <SunIcon cursor="pointer" onClick={toggleColorMode} />
      )} */}
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger="hover" placement="bottom-start">
            <PopoverTrigger>
              <Box
                onClick={() => navItem.href && router.push(navItem.href)}
                fontSize="md"
                fontWeight="bold"
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
                cursor="pointer"
                minW={navItem.label === 'My NFTs' ? '120px' : '120px'}
                textAlign="center"
                color={isSubPath(pathname, navItem.href) ? '#00DAB3' : 'white'}
                lineHeight="64px"
                paddingTop="3px">
                {navItem.label}
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
  const { address } = useStore()

  const NAV_ITEMS = address
    ? NAV_ITEMS_CONNECTED_MOBILE
    : NAV_ITEMS_CONNECTED_MOBILE

  return (
    <Stack bg="white" p={4} display={{ lg: 'none' }} h="100vh">
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem
          key={navItem.label}
          {...navItem}
          onToggleModal={onToggleModal}
        />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({
  label,
  children,
  iconActive,
  href,
  icon,
  iconDark,
  onToggleModal,
}: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()
  const router = useRouter()
  const { colorMode } = useColorMode()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        bg="white"
        color="black"
        py={2}
        as={Link}
        onClick={() => {
          href && router.push(href)
          !children && onToggleModal()
        }}
        justify={{ base: 'space-between', md: 'space-between' }}
        align="center"
        _hover={{
          textDecoration: 'none',
        }}>
        <Flex>
          <Image
            cursor="pointer"
            src={isOpen ? iconActive : icon}
            w="24px"
            h="24px"
            alt=""
            mr="16px"
          />
          <Text fontWeight={900} color={isOpen ? '#6423F1' : '#606062'}>
            {label}
          </Text>
        </Flex>
        {children ? (
          <Icon
            as={ChevronDownIcon}
            transition="all .25s ease-in-out"
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            color={isOpen ? '#6423F1' : '#606062'}
            h={6}
          />
        ) : (
          <Icon
            as={ChevronRightIcon}
            transition="all .25s ease-in-out"
            w={6}
            color="#606062"
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          pl="40px"
          borderLeft={0}
          borderStyle="solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          fontWeight="bold"
          color="#606062"
          align="start">
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}
