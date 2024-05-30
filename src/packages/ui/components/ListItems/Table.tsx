import { memo } from 'react'

import TableRow from './TableRow'

type ListTableProps = {
  items: any
  isCustom?: boolean
}

function TableList({ items, isCustom }: ListTableProps) {
  return (
    <>
      {items?.map((item, idx) => {
        return <TableRow isCustom={isCustom} item={item} key={idx} />
      })}
    </>
  )
}

export default memo(TableList)
