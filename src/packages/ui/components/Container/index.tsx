import { useRouter } from 'next/router'

import { Box, Flex } from '@chakra-ui/react'

import Header from '@components/Header'

import { StylesBackground } from '@ts'

export default function Container({
  children = StylesBackground.market,
}: {
  children: any
}) {
  const router = useRouter()
  const { pathname } = router
  if (pathname.includes('/account')) {
    return (
      <Box
        overflow="hidden"
        backgroundImage="/static/common/bg-main.jpg"
        backgroundColor="#0B063B"
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
        border="2px solid violet"
        backgroundAttachment="fixed"
        minH="100vh"
        pos="relative"
        color="white">
        <Header />

        <Box
          mx="auto"
          pt={{ base: '75px', md: '85px' }}
          pb={{ base: '75px', lg: 'unset' }}>
          {children}
        </Box>
      </Box>
    )
  }

  if (pathname === '/[id]') {
    return (
      <Box
        overflow="hidden"
        backgroundImage="/static/common/bg-main.jpg"
        backgroundColor="#0B063B"
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
        border="2px solid violet"
        backgroundAttachment="fixed"
        minH="100vh"
        pos="relative"
        color="white">
        <Header />

        <Box
          mx="auto"
          pt={{ base: '75px', md: '85px' }}
          pb={{ base: '75px', lg: 'unset' }}>
          {children}
        </Box>
      </Box>
    )
  }
  return (
    <Flex
      justifyContent="center"
      overflow="hidden"
      backgroundImage="/static/common/bg-main.jpg"
      backgroundColor="#0B063B"
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
      backgroundAttachment="fixed"
      minH="100vh"
      color="white">
      <Box maxWidth="1440px" pos="relative">
        <Header />

        <Box
          mx="auto"
          pt={{ base: '75px', md: '85px' }}
          pb={{ base: '75px', lg: 'unset' }}>
          {children}
        </Box>
      </Box>
    </Flex>
  )
}
