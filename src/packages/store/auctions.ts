import { ethers } from 'ethers'
import moment, { Moment } from 'moment'
import { web3Modal } from 'packages/web3'
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import FroopyABI323 from 'packages/abis/demo/fl409.json'

import { getAuctionInfo, getUserNftList } from 'packages/service/api'



const FL_CONTRACT_ADR = process.env.NEXT_PUBLIC_FL_CONTRACT_ADR //323的今天晚上0点开始位置拍卖

export enum ActivityStatus {
  NotStarted = 0,
  Bidding = 1,
  Staking = 2,
  End = 3
}

type IAuctionInfo = {
  gameId: number,
  status: ActivityStatus,
  startTimestamp: Date,
  endTimestamp: Date,
  highestBid: number,
  biddersCount: number
  bidWinnerAddress: string
}

interface IState {
  startTime: moment.Moment
  state: ActivityStatus
  roundInfo: any
  auctionInfo: IAuctionInfo
  nftList: any
  setStartTime: (date: moment.Moment) => void
  setStartTimeByContract: () => void
  getAuctionInfo: typeof getAuctionInfo
  getUserNftList: typeof getUserNftList
}



const useAuctions = create(immer<IState>(((set, get) => ({
    startTime: moment(),
    state: ActivityStatus.NotStarted,
    roundInfo: null,
    auctionInfo: null,
    nftList: [],
    setStartTime(date: moment.Moment) {
      set({
        startTime: date
      })
    },

    async getAuctionInfo() {
      const data = await getAuctionInfo()
      set({ auctionInfo: data })
      return data
    },
    async getUserNftList(address: string) {
      const data = await getUserNftList(address) || []
      set({ nftList: data.nftList })
      return data
    },
    async setStartTimeByContract() {
      const provider = await web3Modal.connect()    
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()
      // const address = await signer.getAddress()

      const contract = new ethers.Contract(FL_CONTRACT_ADR, FroopyABI323, signer)
      const tx = await contract.bidRoundInfo()
      
      console.log(tx, 'tx')
      
      set({
        roundInfo: tx
      })
    },
}))))


export default useAuctions