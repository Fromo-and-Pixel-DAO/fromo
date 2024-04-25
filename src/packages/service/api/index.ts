import http from '../index'
import { IAuctionInfo, IBidInfo, IGameAmountNft, IGameInfo, INftList, IOpenSeaNftList, IProfit, IUserDividends, IUserRetrieved } from './types'

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

/**
 * @description: Get the game detail by id
 * @param {string} userAddress user address
 * @param {string} gameId game id
 * @return {*}
 */
export const getGameDetailById = (userAddress: string, gameId: string) => http.get<IGameAmountNft>(`/fl/user/gameDetail/${userAddress}/${gameId}`)

/**
 * @description: Get the system brief
 * @return {*}
 */
export const getSysBrief = () => http.get<IGameInfo>('/fl/game/getSysBrief')

/**
 * @description: Get the auction info
 * @return {*}
 */
export const getAuctionInfo = () => http.get<IAuctionInfo>('/fl/game/getAuctionInfo')


/**
 * @description: Get the user's NFT list
 * @param {string} address
 * @return {*}
 */
export const getUserNftList = (address: string) => http.get<IOpenSeaNftList>(`/fl/nft/getUserNftList/${address}/200`) // /walletAddress/pageNumber

/**
 * @description: Get the bidder form
 * @return {*}
 */
export const getBidderForm = () => http.get<IBidInfo[]>('/fl/game/getBidderForm')

/**
 * @description: Get the stake notices
 * @param {string} address
 * @return {*}
 */
export const getStakeNotices = (address: string) => http.get<number>(`/fl/user/getStakeNotices/${address}`)

/**
 * @description: Get the nft auctions
 * @return {*}
 */
export const getNftAuctions = () => http.get<INftList>('/fl/nft/getNftAuctions/1')




