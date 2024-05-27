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
  borderColor?: string
  borderBottomColor?: string
  borderBottom?: string
  colorHeaderTable?: string
  fontSizeHeaderTable?: string
  fontWeightHeaderTable?: string
  borderLeftWidth?: string
  borderTopWidth?: string
  paddingTopHeader?: string
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
    border = ' 1px solid',
    borderColor = '#704BEA80',
    borderBottom = '1px solid',
    borderBottomColor = '#704BEA80',
    colorHeaderTable = '#FFA8FE',
    fontSizeHeaderTable = '14px',
    fontWeightHeaderTable,
    borderLeftWidth,
    borderTopWidth,
  } = props

  return (
    <TableContainer
      background={background}
      border={border}
      borderLeftWidth={borderLeftWidth}
      borderTopWidth={borderTopWidth}
      borderColor={borderColor}
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
      <Table variant="simple" backdropFilter="blur(5px)">
        <Thead>
          <Tr
            borderBottom={borderBottom}
            borderBottomColor={borderBottomColor}
            pt={paddingTopHeader}>
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
