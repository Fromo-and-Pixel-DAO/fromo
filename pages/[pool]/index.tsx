import { FC, memo } from 'react'

import Head from 'next/head'

import { Box } from '@chakra-ui/react'

// import DetailPool from '@modules/DetailPool'
import Details from '@modules/Detail'

const DetailPage: FC = () => {
  return (
    <>
      <Head>
        <title>FROMO</title>
        <meta name="description" content="PoolZ." />
        <meta name="keywords" content="Pool, froppyLand, crypto, nft, eth, " />
      </Head>

      <Box p={0}>
        <Details />
      </Box>
    </>
  )
}

export default memo(DetailPage)
