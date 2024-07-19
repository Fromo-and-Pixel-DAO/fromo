import { ethers } from 'ethers'
import moment from 'moment'
import FroopyABI323 from 'packages/abis/demo/fl419.json'
import { web3Modal } from 'packages/web3'
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getAuctionInfo, getUserNftList } from 'packages/service/api'
import { IAuctionInfo, IGameNftDetail } from 'packages/service/api/types'

const FL_CONTRACT_ADR: string = process.env
  .NEXT_PUBLIC_FL_CONTRACT_ADR as string

export enum ActivityStatus {
  NotStarted = 0,
  Bidding = 1,
  Staking = 2,
  End = 3,
}

interface IState {
  startTime: moment.Moment
  state: ActivityStatus
  roundInfo: any
  auctionInfo: IAuctionInfo | null
  nftList: IGameNftDetail[]
  setStartTime: (date: moment.Moment) => void
  setStartTimeByContract: () => void
  getAuctionInfo: typeof getAuctionInfo
  getUserNftList: typeof getUserNftList
}

const useAuctions = create(
  immer<IState>((set, get) => ({
    startTime: moment(),
    state: ActivityStatus.NotStarted,
    roundInfo: null,
    auctionInfo: null,
    nftList: [],
    setStartTime(date: moment.Moment) {
      set({
        startTime: date,
      })
    },

    async getAuctionInfo() {
      const data = await getAuctionInfo()
      // const provider = await web3Modal.connect()
      // const library = new ethers.providers.Web3Provider(provider)
      // const signer = library.getSigner()
      // const contract = new ethers.Contract(
      //   FL_CONTRACT_ADR,
      //   FroopyABI323,
      //   signer,
      // )
      // console.log({ data })
      // const bidInfo = await contract.bidRoundInfo()
      // console.log({ bidInfo })
      set({
        auctionInfo: {
          ...data,
          // Why need to set the bidWinnerAddress when init?
          // bidWinnerAddress: bidInfo?.bidWinner,
        },
      })
      return data
    },
    async getUserNftList(address: string) {
      const data = await getUserNftList(address)
      set({ nftList: data.nftList })
      return data
    },
    async setStartTimeByContract() {
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()
      const contract = new ethers.Contract(
        FL_CONTRACT_ADR,
        FroopyABI323,
        signer,
      )
      const tx = await contract.bidRoundInfo()
      set({
        roundInfo: tx,
      })
    },
  })),
)

export default useAuctions
