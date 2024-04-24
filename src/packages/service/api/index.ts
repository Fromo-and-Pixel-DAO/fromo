import http from '../index'
import { IGameAmountNft, INftList, IProfit, IUserDividends, IUserRetrieved } from './types'

/**
 * @description: Get the user's profit
 * @param {string} userAddress user address
 * @return {*}
 */
export const getMyProfit = (userAddress: string) => http.get<IProfit>(`/fl/user/myProfit/${userAddress}`)


/**
 * @description: Get historical dividends and prize
 * @param {string} userAddress user address
 * @param {number} pageNum page number start from 1
 * @param {number} status 0 unclaimed 1 claimed
 * @return {*}
 */
export const getHistoricalDividendsAndPrize = (userAddress: string, pageNum: number, status: number) => http.get<IUserDividends>(`/fl/user/historicalDividendsAndPrize/${userAddress}/${pageNum}/${status}`)

/**
 * @description: Get the user's NFT
 * @param {string} userAddress
 * @param {number} pageNum
 * @return {*}
 */
export const getMyPurchasedNfts = (userAddress: string, pageNum: number) => http.get<IUserRetrieved>(`/fl/user/myPurchasedNfts/${userAddress}/${pageNum}`)

/**
 * @description: Get the user's participation games
 * @param {string} userAddress user address
 * @param {number} status 1 ongoing 2 ended 3 all
 * @return {*}
 */
export const getMyParticipationGames = (userAddress: string, status?: number) => http.get<INftList>(status ? `/fl/user/myParticipationGames/${userAddress}/${status}` : `/fl/user/myParticipationGames/${userAddress}`)

/**
 * @description: Get the user's auctions
 * @param {string} userAddress user address
 * @param {number} status 0 upcoming 1 ongoing 2 ended 3 all
 * @return {*}
 */
export const getMyAuctions = (userAddress: string, status?: number) => http.get<INftList>(status ? `/fl/user/myAuctions/${userAddress}/${status}` : `/fl/user/myAuctions/${userAddress}`)

/**
 * @description: Get nft pool list
 * @param {number} pageNum page number start from 1
 * @return {*}
 */
export const getNftPoolList = (pageNum: number) => http.get<INftList>('/fl/nft/getNftPoolList/1')

export const getGameDetailById = (userAddress: string, gameId: string) => http.get<IGameAmountNft>(`/fl/user/gameDetail/${userAddress}/${gameId}`)

export const getAuctionInfo = () => http.get<Promise<any>>('/fl/game/getAuctionInfo')


export const getUserNftList = (address: string) => http.get<Promise<any>>(`/fl/nft/getUserNftList/${address}/200`) // /walletAddress/pageNumber

export const getBidderForm = () => http.get<Promise<any>>('/fl/game/getBidderForm')

export const getSysBrief = () => http.get<Promise<any>>('/fl/game/getSysBrief')

export const getNftAuctions = () => http.get<Promise<any>>('/fl/nft/getNftAuctions/1')




