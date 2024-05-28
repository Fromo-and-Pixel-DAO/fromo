import { memo, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

type RenderTabsType = {
  id: number
  title: string
  render: JSX.Element
  value: string
}

type TabsCommonProps = {
  renderTabs: RenderTabsType[]
  initTab?: string
  variant?: string
  gridAndListMode?: boolean
  fontSizeTable?: {
    header: string
    text: string
  }
  onSwitch?: (tab: string) => void
}
function TabsCommon({
  renderTabs,
  initTab,
  variant,
  gridAndListMode = true,
  fontSizeTable,
  onSwitch = () => {},
}: TabsCommonProps) {
  const [selectedTab, setSelectedTab] = useState(initTab)

  const router = useRouter()
  const { pathname } = router
  const checkAccountPage = pathname.includes('/account/my-nfts')

  useEffect(() => {
    if (router.isReady) {
      if (router.query?.tab) {
        setSelectedTab(router.query.tab as string)
      }
    }
  }, [initTab, router.isReady, router.query.tab])

  const onChangeTab = (index: number) => {
    if (renderTabs.length > 1) {
      const selectedTab = renderTabs[index]?.value || initTab
      setSelectedTab(selectedTab)
      onSwitch(selectedTab)
    }
  }

  return (
    <Tabs
      variant={variant}
      index={renderTabs.findIndex((it) => it.value === selectedTab)}
      onChange={onChangeTab}>
      <TabList
        sx={{
          scrollbarWidth: 'none',
          borderColor: 'rgba(255,255,255, 0.2)',
          color: 'rgba(255,255,255, 0.8)',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}>
        <Flex w="100%" justify="space-between" align="center">
          <Flex align="center" gap="20px">
            {renderTabs?.map((item) => (
              <Tab
                py="8px"
                px={0}
                key={item.title}
                whiteSpace="nowrap"
                fontSize="14px"
                fontWeight="400"
                color="white"
                _selected={{
                  fontWeight: '600',
                  color: '#1DFED6',
                  borderBottomColor: '#1DFED6',
                }}>
                {item.title}
              </Tab>
            ))}
          </Flex>
          {/* {!checkAccountPage && gridAndListMode && <GridAndList />} */}
        </Flex>
      </TabList>

      <TabPanels>
        {renderTabs?.map((item) => {
          return (
            <TabPanel
              fontSize="14px"
              lineHeight="20px"
              fontWeight={500}
              p={0}
              key={item.id}>
              {item.render}
            </TabPanel>
          )
        })}
      </TabPanels>
    </Tabs>
  )
}

export default memo(TabsCommon)
