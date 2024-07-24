export const metadata = {
  title: 'FROMO',
  description: 'FROMO',
}
import { ChakraProvider } from '@chakra-ui/react'
import { RainbowKitProvider, type Locale } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import customTheme from '@styles/customTheme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { isProd } from 'packages/constants'
import { ToastContainer } from 'react-toastify'
import useVH from 'react-vh'
import { WagmiProvider } from 'wagmi'
import { config } from '../src/configChanis'
import Script from 'next/script'

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
              <Script
                src="https://cdn.jsdelivr.net/npm/eruda@3.2.0/eruda.min.js"
                strategy="lazyOnload" // Loads script after the page is interactive
                onLoad={() => {
                  if (typeof window !== 'undefined') {
                    eruda.init()
                  }
                }}
              />
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
