import { useRouter } from 'next/router'

import {
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react'

interface Props {
  columns: Array<string>
  renderItem: JSX.Element
  background?: string
  border?: string
  colorHeaderTable?: string
  fontSizeHeaderTable?: string
  fontWeightHeaderTable?: string
  borderLeftWidth?: string
  borderTopWidth?: string
  paddingTopHeader?: string
  minWithTable?: string
}

export default function CommonTable(props: Props) {
  const router = useRouter()
  const isAccountPage = router.pathname.includes('account')
  const bgScrollBar = useColorModeValue('#FFA8FE', '#ddd')
  const {
    columns,
    paddingTopHeader,
    renderItem = [],
    background = 'transparent',
    colorHeaderTable = '#FFA8FE',
    fontSizeHeaderTable = '14px',
    fontWeightHeaderTable,
    minWithTable = '',
  } = props

  return (
    <TableContainer
      background={background}
      border="unset"
      whiteSpace="unset"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: isAccountPage ? 'rgba(0, 0, 0, 0.2)' : bgScrollBar,
          borderRadius: '24px',
        },
      }}>
      <Table minW={minWithTable} variant="simple" backdropFilter="blur(5px)">
        <Thead>
          <Tr pt={paddingTopHeader}>
            {columns?.map((item, index) => {
              return (
                <Th
                  borderBottom="none"
                  color={colorHeaderTable}
                  fontSize={fontSizeHeaderTable}
                  fontWeight="700"
                  pl="0px"
                  pt="20px"
                  key={item}>
                  {item}
                </Th>
              )
            })}
          </Tr>
        </Thead>
        <Tbody>{renderItem}</Tbody>
      </Table>
    </TableContainer>
  )
}
