import { useRouter } from 'next/router'

import { Box, Flex, Select } from '@chakra-ui/react'

import { useEffect, useState } from 'react'

const sidebarsSection = [
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
  const router = useRouter()

  const { pathname } = router
  const [titleSelect, setTitleSelect] = useState(sidebarsSection[0].href)

  const handleOptionClick = (href: string) => {
    setTitleSelect(href)
    router.push(href)
  }

  useEffect(() => {
    const currentOption = sidebarsSection.find(
      (option) => option.href === router.pathname,
    )
    if (currentOption) {
      setTitleSelect(currentOption.href)
    }
  }, [router.pathname])

  return (
    <>
      <Box
        w="328px"
        display={{
          base: 'none',
          lg: 'block',
        }}>
        <Flex mt="40px" pl="68px" flexDir="column" gap="32px">
          {sidebarsSection.map((item) => (
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
      </Box>
      <>
        <Box
          display={{ base: 'block', lg: 'none' }}
          className="profile"
          mt="20px">
          <Select
            border="none"
            _focusVisible={{ border: 'none' }}
            boxShadow="none"
            fontSize={{ base: '24px', md: '28px', xl: '32px' }}
            lineHeight="36px"
            fontWeight="800"
            onChange={(e) => handleOptionClick(e.target.value)}
            value={titleSelect}>
            {sidebarsSection.map((i) => (
              <option key={i.id} value={i.href}>
                {i.title}
              </option>
            ))}
          </Select>
        </Box>
      </>
    </>
  )
}
