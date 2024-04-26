import { FC, memo } from 'react'

import Head from 'next/head'

import Main from '@modules/Market/Main'

const HomePage: FC = () => {
  return (
    <>
      <Head>
        <title>FROMO</title>
        <meta name="description" content="PoolZ." />
        <meta name="keywords" content="poolz, froppyLand, crypto, nft, eth, " />
      </Head>

      <Main />
    </>
  )
}

export default memo(HomePage)
