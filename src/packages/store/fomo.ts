import { faker } from '@faker-js/faker'
import { generateTimestamp } from '@modules/Market/Main'
import { ethers } from 'ethers'
import { getMyProfit, getNftAuctions } from 'packages/service/api'
import { IProfit } from 'packages/service/api/types'
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface IState {
  loading: boolean
  gameList: any[]
  userHeaderInfo: any[]
  upcomingList: any[]
  ongoingList: any[]
  finishedList: any[]
  setGameList: (web3Provider: ethers.providers.Web3Provider) => void
  getNftAuctions: () => Promise<void>
  getUserHeaderInfo: (address: string) => Promise<IProfit>
}

const FL_CONTRACT_ADR: string = process.env
  .NEXT_PUBLIC_FL_CONTRACT_ADR as string
const useFomoStore = create(
  immer<IState>((set) => ({
    gameList: [],
    upcomingList: [],
    ongoingList: [],
    finishedList: [],
    userHeaderInfo: [
      {
        name: '$OMO Price',
        number: '-',
        unit: '$',
      },
      {
        name: 'My Key Holder Dividends',
        number: '-',
        unit: 'ETH',
      },
      {
        name: 'My NFT Provider Dividends',
        number: '-',
        unit: 'ETH',
      },
      {
        name: 'My Final Winner Prize',
        number: '-',
        unit: 'ETH',
      },
    ],
    loading: false,
    async setGameList(web3Provider: ethers.providers.Web3Provider) {
      try {
        const imageUrls = [
          'https://i.seadn.io/gcs/files/16d9892108638a415d1244943f908fad.png?auto=format&dpr=1&w=1000',
          'https://i.seadn.io/gcs/files/247c8f8946f77b9132326a4ff2340903.png?auto=format&dpr=1&w=1000',
          'https://i.seadn.io/gcs/files/d4a9c0b5a6467a93f192c6043fe329b0.png?auto=format&dpr=1&w=1000',
          'https://i.seadn.io/gcs/files/7b7c959e8453c734c115083d87844d05.png?auto=format&dpr=1&w=1000',
          'https://i.seadn.io/gcs/files/f149b2d37d093ca7b8853dce5faafca1.png?auto=format&dpr=1&w=1000',
          'https://i.seadn.io/gcs/files/1559b8597ed4db6578a218f181f24716.png?auto=format&dpr=1&w=1000',
        ]

        const gamesByIds = [0]
        const gameList = []

        for (const id of gamesByIds) {
          try {
            // const tx = await contract.getGameInfoOfGameIds(id)
            // const [state] = await contract.getGameStateOfGameIds([id])
            // const [endTime] = await contract.getGameEndTimestampOfGameIds([id])
            // console.log(tx, '<===tx')
            gameList.push({
              // ...tx,
              id,
              nftImage: imageUrls[id],
              nftName: faker.internet.userName(),
              // endTime: tx.endTimestamp.toNumber(),
              // startTimestamp: tx.startTimestamp.toNumber()
            })
          } catch (error) {
            console.error(`Error fetching data for game ID ${id}:`, error)
            gameList.push({
              gameId: id,
              error: true,
            })
          }
        }

        const generateMockData = (list, state) => {
          const num = 6
          const len = num - list.length
          if (len <= 0) return []
          return Array.from({ length: len }, (_, i) => {
            const clonedItem = { ...list[0] }
            delete clonedItem.state
            delete clonedItem.id
            const total = faker.number.int({ min: 100, max: 500 })

            const totalKeyMinted = ethers.BigNumber.from(total.toString())
            // const salesRevenue = totalKeyMinted.mul(clonedItem.price)
            const ids = ['#404', '#1796', '#1345', '#284', '#672', '#1832']

            return {
              ...clonedItem,
              id: faker.number.int(),
              endTime: generateTimestamp(),
              startTimestamp: generateTimestamp(),
              isClone: true,
              totalKeyMinted: state === 0 ? null : totalKeyMinted,
              state,
              nftName: 'The Two Boys' + ids[i],
              nftImage: imageUrls[i],
            }
          })
        }

        const upcomingList = gameList.filter((v) => v.state === 0)
        const ongoingList = gameList.filter((v) => v.state === 1)
        const finishedList = gameList.filter((v) => v.state === 2)

        const renderList = () => {
          return [
            ...upcomingList.concat(generateMockData(upcomingList, 0)),
            ...ongoingList.concat(generateMockData(ongoingList, 1)),
            ...finishedList.concat(generateMockData(finishedList, 2)),
          ]
        }
        const data = renderList()
        set({
          gameList: data,
          upcomingList: [
            ...upcomingList.concat(generateMockData(upcomingList, 0)),
          ],
          ongoingList: [
            ...ongoingList.concat(generateMockData(ongoingList, 1)),
          ],
          finishedList: [
            ...finishedList.concat(generateMockData(finishedList, 2)),
          ],
        })
      } catch (error) {
        console.error('Error initializing contract:', error.message)
      }
    },
    async getNftAuctions() {
      const { nftList } = await getNftAuctions()

      const upcomingList = nftList.filter((v) => v.status === 0)
      const ongoingList = nftList.filter((v) => v.status === 1)
      const finishedList = nftList.filter((v) => v.status === 2)

      set({
        gameList: nftList,
        upcomingList,
        ongoingList,
        finishedList,
      })
    },
    async getUserHeaderInfo(address: string): Promise<any> {
      const profit = await getMyProfit(address)
      if (profit) {
        set({
          userHeaderInfo: [
            {
              name: '$OMO Price',
              number: profit.flPrice,
              unit: '$',
            },
            {
              name: 'My Key Holder Dividends',
              number: profit.keyDividends,
              unit: 'ETH',
            },
            {
              name: 'My NFT Provider Dividends',
              number: profit.nftDividends,
              unit: 'ETH',
            },
            {
              name: 'My Final Winner Prize',
              number: profit.finalWinPrice,
              unit: 'ETH',
            },
          ],
        })
        return profit
      }
    },
  })),
)

export default useFomoStore
