import { FC, memo } from 'react'


import { Box } from '@chakra-ui/react'

// import DetailPool from '@modules/DetailPool'
import Details from '@modules/Detail'

const DetailPage: FC = () => {
  return (
    <>
      <Box p={0}>
        <Details />
      </Box>
    </>
  )
}

export default memo(DetailPage)
