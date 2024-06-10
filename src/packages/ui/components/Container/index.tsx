import { useRouter } from 'next/router'

import { Box } from '@chakra-ui/react'

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
        bgGradient="linear(to-b,#2A0668 6.48%,#401EAF 100%)"
        minH="100vh"
        pos="relative"
        color="white">
        <Header />

        <Box mx="auto" pt="70px">
          {children}
        </Box>
      </Box>
    )
  }

  if (pathname === '/[id]') {
    return (
      <Box
        overflow="hidden"
        bgGradient="linear(to-b,#2A0668 6.48%,#401EAF 100%)"
        minH="100vh"
        pos="relative"
        color="white">
        <Header />

        <Box mx="auto" pt="70px">
          {children}
        </Box>
      </Box>
    )
  }
  return (
    <Box
      overflow="hidden"
      backgroundImage="/static/common/bg-main.svg"
      backgroundColor="#0B063B"
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
      backgroundAttachment="fixed"
      minH="100vh"
      pos="relative"
      color="white">
      <Header />

      {/* <Box
        mx="auto"
        pt={{ base: '75px', md: '85px' }}
        pb={{ base: '75px', lg: 'unset' }}>
        {children}
      </Box> */}
    </Box>
  )
}
