import { useRouter } from 'next/router'

import {
  Box,
  Checkbox,
  CheckboxGroup,
  Flex,
  Select,
  Text,
} from '@chakra-ui/react'
import useStore from 'packages/store'

import { useWindowSize } from '@hooks/useWindowSize'

import { PathnameType } from '@ts'
import { useEffect, useState } from 'react'

const sidebarsSection1 = [
  {
    id: 0,
    title: 'My Assets',
    value: 'myAssets',
    href: '/profile',
  },
  {
    id: 1,
    title: 'My Participation',
    value: 'myParticipation',
    href: '/profile/participation',
  },
  {
    id: 2,
    title: 'My Auctions',
    value: 'myAuctions',
    href: '/profile/auctions',
  },
]

export default function Sidebar() {
  const { width } = useWindowSize()
  const router = useRouter()
  const { address } = useStore()
  const { pathname, asPath } = router
  const [titleSelect, setTitleSelect] = useState(sidebarsSection1[0].href)

  useEffect(() => {
    const currentOption = sidebarsSection1.find(
      (option) => option.href === router.pathname,
    )
    if (currentOption) {
      setTitleSelect(currentOption.href)
    }
  }, [router.pathname])

  const handleOptionClick = (href: string) => {
    setTitleSelect(href)
    router.push(href)
  }

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

  return (
    <>
      {width > 1280 ? (
        <Box w="328px">
          <Flex mt="40px" pl="68px" flexDir="column" gap="32px">
            {sidebarsSection1.map((item) => (
              <Box
                color={
                  item.href === pathname ? '#1DFED6' : 'rgba(255,255,255,0.8)'
                }
                fontWeight={item.href === pathname ? '600' : '400'}
                cursor="pointer"
                key={item.href}
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
          <Box className="profile" mt="20px">
            <Select
              border="none"
              _focus="none"
              _hover="none"
              boxShadow="none"
              fontSize={{ base: '24px', md: '28px', xl: '32px' }}
              lineHeight="36px"
              fontWeight="800"
              onChange={(e) => handleOptionClick(e.target.value)}
              value={titleSelect}>
              {sidebarsSection1.map((i) => (
                <option key={i.id} value={i.href}>
                  {i.title}
                </option>
              ))}
            </Select>
          </Box>
        </>
      )}
    </>
  )
}
