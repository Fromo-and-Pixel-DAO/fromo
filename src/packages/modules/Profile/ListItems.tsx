import { memo } from 'react'

import { Box, Flex, Spinner, useBreakpointValue } from '@chakra-ui/react'

import CommonTable from '@components/CommonTable'
import NoData from '@components/NoData'

import Table from '@components/ListItems/Table'

import ReactPaginate from 'react-paginate'

interface ListItemsProps {
  isLoading: boolean
  items: any[]
  haveGridMode?: boolean
  columnsGrid?: number[]
  currentPage: number
  setCurrentPage: (page: number) => void
  isCustom?: boolean
  total?: number
  columnsList?: Array<string>
}

function ListItems({
  isLoading,
  isCustom,
  items,
  haveGridMode = true,
  columnsGrid = [1, 2, 3, 4, 5, 6],
  total,
  currentPage,
  setCurrentPage,
  columnsList,
}: ListItemsProps) {
  const itemsPerPage =
    useBreakpointValue(
      {
        base: 4,
        sm: 4,
        md: 9,
        lg: 12,
        xl: 15,
        '2xl': 18,
      },
      {
        fallback: 'md',
      },
    ) ?? 15

  if (isLoading) {
    return (
      <Box textAlign="center" mt="300px">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Box>
    )
  }

  if (items?.length === 0) {
    return <NoData />
  }
  const handlePageChange = ({ selected: selectedPage }) => {
    setCurrentPage(selectedPage)
  }

  return (
    <Box>
      <CommonTable
        paddingTopHeader="12px"
        borderLeftWidth="0px"
        borderTopWidth="0px"
        fontWeightHeaderTable="400"
        fontSizeHeaderTable="12px"
        columns={columnsList}
        renderItem={<Table isCustom={isCustom} items={items} />}
      />
      <Flex my="30px" justify="center">
        <ReactPaginate
          forcePage={currentPage}
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageChange}
          pageRangeDisplayed={5}
          pageCount={total ? Math.ceil(total / 5) : Math.ceil(items.length / 5)}
          previousLabel="<"
          renderOnZeroPageCount={null}
          containerClassName="pagination_dark"
          activeClassName="active_dark"
        />
      </Flex>
    </Box>
  )
}

export default memo(ListItems)
