export const metadata = {
  title: 'FROMO',
  description: 'FROMO',
}

import '@rainbow-me/rainbowkit/styles.css'
import { useRouter } from 'next/router'

import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, type Locale } from '@rainbow-me/rainbowkit'
import { config } from '../src/configChanis'

import { ToastContainer } from 'react-toastify'
import useVH from 'react-vh'

import { ChakraProvider } from '@chakra-ui/react'

import customTheme from '@styles/customTheme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { isProd } from 'packages/constants'

import '@styles/_globals.scss'
import 'react-toastify/dist/ReactToastify.css'

import Head from 'next/head'
import DefaultLayout from '../src/layout/default'

// import useAuctions from 'packages/store/auctions'

// replace console.* for disable log on production
if (isProd) {
  console.log = () => {}
  console.error = () => {}
  console.debug = () => {}
}

const queryClient = new QueryClient()

const App = ({ Component, pageProps }: any) => {
  useVH()
  // const { setStartTimeByContract } = useAuctions()

  // useEffect(() => {
  //   setStartTimeByContract()
  // }, [])
  const { locale } = useRouter() as { locale: Locale }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale={locale}>
          <ChakraProvider theme={customTheme}>
            <DefaultLayout>
              <Head>
                <title>FROMO</title>
                <meta name="description" content="FROMO" />
                <meta
                  name="keywords"
                  content="fromo, froppyLand, crypto, nft, eth, "
                />
              </Head>
              <Component {...pageProps} />
            </DefaultLayout>
            <ToastContainer autoClose={3000} theme="colored" />
          </ChakraProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
