import {
  getNftMetadata,
  getNftsForOwner,
  getOwnersForNft,
  initializeAlchemy,
  Network,
} from '@alch/alchemy-sdk'
import { Alchemy } from 'alchemy-sdk'
import axios from 'axios'
import { ethers } from 'ethers'
import moment from 'moment'
import OriginNFT from 'packages/abis/contracts/OriginNFT.sol/OriginNFT.json'
import fl419ABI from 'packages/abis/demo/fl419.json'
import ERC20ABI from 'packages/abis/ERC20.json'
import FactoryContractABI from 'packages/abis/FactoryContractABI.json'
import GeneralNFTContractABI from 'packages/abis/GeneralNFTContractABI.json'
import PoolContractABI from 'packages/abis/PoolContractABI.json'
import TokenConverterABI from 'packages/abis/TokenConverterABI.json'

import { isProd } from 'packages/constants'
import { timeFromNow, weiToEtherString } from 'packages/lib/utilities'
import {
  convertValidDurationToString,
  generateTimeString,
  sleep,
} from 'packages/utils'
import Web3Modal, { IProviderOptions } from 'web3modal'

import { NftDeployInfoType } from '@ts'

import { NFT } from './type'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY

const network = isProd ? Network.ETH_MAINNET : Network.ETH_GOERLI

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY, // Replace with your Alchemy API Key.
  network,
  maxRetries: 5,
}
const Web3 = require('web3')

const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_ALCHEMY_INSTANCE),
)
const alchemy = initializeAlchemy(settings)

export const hexToDecimal = (hex) => parseInt(hex, 16)

export const providerOptions: Partial<IProviderOptions> = {
  injected: {
    display: {
      logo: 'https://metamask.io/img/metamask-fox.svg',
      name: 'MetaMask',
    },
    package: 'metamask',
  },
  // walletconnect: {
  //   package: WalletConnectProvider, // required
  //   options: {
  //     infuraId: INFURA_KEY, // required
  //   },
  // },
  // 'custom-walletlink': {
  //   display: {
  //     logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
  //     name: 'Coinbase',
  //     description: 'Connect to Coinbase Wallet (not Coinbase App)',
  //   },
  //   options: {
  //     appName: 'Coinbase', // Your app name
  //     networkUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  //     chainId: 1,
  //   },
  //   package: WalletLink,
  //   connector: async (_: any, options: any) => {
  //     const { appName, networkUrl, chainId } = options
  //     const walletLink = new WalletLink({
  //       appName,
  //     })
  //     const provider = walletLink.makeWeb3Provider(networkUrl, chainId)
  //     await provider.enable()
  //     return provider
  //   },
  // },
}
// Factory contract
export const getFactoryContract = () => {
  return new web3.eth.Contract(
    FactoryContractABI,
    process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
  )
}

// Original NFT contract
export const getOriginalNFTContract = (originalNFTContract: string) => {
  return new web3.eth.Contract(GeneralNFTContractABI, originalNFTContract)
}

// Pool contract
export const getPoolContract = (PoolContractAddress: string) => {
  return new web3.eth.Contract(PoolContractABI, PoolContractAddress)
}

// Token Converter contract
export const getTokenConverterContract = (ConverterContractAddress: string) => {
  return new web3.eth.Contract(TokenConverterABI, ConverterContractAddress)
}

// Create new public pool
export async function createPublicPoolFunc(contractAddress: string) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    String(process.env.NEXT_PUBLIC_FACTORY_ADDRESS),
    FactoryContractABI,
    signer,
  )
  const transaction = await contract.createDerivativeContract(contractAddress)

  return await transaction.wait()
}

export async function mintFreeLicenseFunc(poolContractAddress: string) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )

  const transaction = await contract.mintItem({ value: 0 })
  return await transaction.wait()
}

export async function getPoolTokenCounterFunc(poolContractAddress: string) {
  const poolContract = getPoolContract(poolContractAddress)
  return await poolContract.methods._tokenCounter().call()
}

export async function getLicenseOwnerListFunc(poolContractAddress: string) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  const poolContract = getPoolContract(poolContractAddress)
  const owners = await poolContract.methods.getLicenseOwnerList().call()
  return owners
    ?.filter((owner) => owner !== ZERO_ADDRESS)
    ?.map((address) => address.toLowerCase())
}

/**
 * @description: check if the user has approved the pool contract to spend $omo
 * @return {*}
 */
export async function checkApprovalFunc(
  contractAddress: string = process.env.NEXT_PUBLIC_FL_CONTRACT_ADR,
) {
  console.log(process.env.NEXT_PUBLIC_FLT_CONTRACT_ADR)

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const address = await signer.getAddress()
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_FLT_CONTRACT_ADR,
    ERC20ABI,
    signer,
  )

  const allowance = await contract.allowance(address, contractAddress)
  if (allowance.gt(0)) {
    return true
  }
  return false
}

/**
 * @description: approve the pool contract to spend $omo
 * @param {string} contractAddress
 * @return {*}
 */
export async function approveBidTokenFunc(
  contractAddress: string = process.env.NEXT_PUBLIC_FL_CONTRACT_ADR,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const address = await signer.getAddress()
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_FLT_CONTRACT_ADR,
    ERC20ABI,
    signer,
  )
  const transaction = await contract.approve(
    contractAddress,
    ethers.constants.MaxUint256,
  )
  await transaction.wait()
  const allowance = await contract.allowance(address, contractAddress)
  if (allowance.gt(0)) {
    return true
  }
  return false
}

/**
 * @description: get the balance of the user $omo
 * @param {string} address
 * @return {*}
 */
export async function getBalanceOfFunc() {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const address = await signer.getAddress()
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_FLT_CONTRACT_ADR,
    ERC20ABI,
    signer,
  )
  const balance = await contract.balanceOf(address)
  return balance
}

/**
 * @description: withdraw the $omo from the pool
 * @param {number} amount $omo amount
 * @param {string} contractAddress pool contract address
 * @return {*}
 */
export async function withdrawBidTokenFunc(
  amount: number,
  contractAddress: string = process.env.NEXT_PUBLIC_FL_CONTRACT_ADR,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const flContract = new ethers.Contract(contractAddress, fl419ABI, signer)
  const transaction = await flContract.withdrawBidToken(
    ethers.utils.parseEther(String(amount)),
  )
  return await transaction.wait()
}

/**
 * @description: deposit $omo to the pool
 * @param {number} amount $omo amount
 * @param {string} contractAddress pool contract address
 * @return {*}
 */
export async function depositBidTokenFunc(
  amount: number,
  contractAddress: string = process.env.NEXT_PUBLIC_FL_CONTRACT_ADR,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(contractAddress, fl419ABI, signer)
  const transaction = await contract.depositBidToken(
    ethers.utils.parseEther(String(amount)),
  )
  return await transaction.wait()
}

/**
 * @description: covet the keys to $OMO
 * @param {number} gameIds
 * @param {string} userAddress
 * @return {*}
 */
export async function convertKeyToToken(gameIds: number[]) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const address = await signer.getAddress()
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_FL_CONTRACT_ADR,
    fl419ABI,
    signer,
  )
  const transaction = await contract.convertKeyToToken(gameIds, address, {
    gasLimit: BigInt(500000),
  })
  return await transaction.wait()
}

/**
 * @description: claim the unclaimed keys
 * @param {number} gameIds game ids
 * @return {*}
 */
export async function claimBonusFunc(gameIds: number[]) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const address = await signer.getAddress()
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_FL_CONTRACT_ADR,
    fl419ABI,
    signer,
  )
  const transaction = await contract.claimBonus(gameIds, address)
  return await transaction.wait()
}

/**
 * @description: claim the unclaimed final winner prize
 * @param {number} gameIds game ids
 * @return {*}
 */
export async function withdrawLastplayerPrizeFunc(gameIds: number[]) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_FL_CONTRACT_ADR,
    fl419ABI,
    signer,
  )
  const transaction = await contract.withdrawLastplayerPrize(gameIds, {
    gasLimit: BigInt(500000),
  })
  return await transaction.wait()
}

/**
 * @description: claim the unclaimed NFTs
 * @param {number} gameIds game ids
 * @return {*}
 */
export async function withdrawSaleRevenueFunc(gameIds: number[]) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const address = await signer.getAddress()
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_FL_CONTRACT_ADR,
    fl419ABI,
    signer,
  )
  const transaction = await contract.withdrawSaleRevenue(gameIds, {
    gasLimit: BigInt(500000),
  })
  return await transaction.wait()
}

export async function depositFunc(poolContractAddress: string, amount: number) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.deposit({
    value: ethers.utils.parseEther(String(amount)),
  })
  return await transaction.wait()
}

export async function getAllOwnedNFTsFunc(address: any) {
  try {
    const nftsForOwner = await getOwnedNFTsMyNFT(address)
    const factoryContract = getFactoryContract()
    const pools = await factoryContract.methods.getNFTPoolInfo().call()
    const NFTs = nftsForOwner?.map((nft) => {
      const pool = pools.find(
        (p) =>
          p.originalContractAddress.toLowerCase() ==
          nft.contractAddress.toLowerCase(),
      )
      return {
        ...nft,
        poolAddress: pool?.derivativeContractAddress,
      }
    })
    return NFTs
  } catch (error) {
    console.error(error)
  }
}

export async function stakeFunc(poolContractAddress: string, tokenId: string) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.stake(tokenId)
  return await transaction.wait()
}

export async function unstakeFunc(
  poolContractAddress: string,
  tokenId: string,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.unstake(tokenId)
  return await transaction.wait()
}

export async function approveFunc(
  poolContractAddress: string,
  originalNFTContract: string,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    originalNFTContract,
    GeneralNFTContractABI,
    signer,
  )

  const transaction = await contract.setApprovalForAll(
    poolContractAddress,
    true,
  )
  return await transaction.wait()
}

export async function checkIfThisPoolHasBeenApprovedFunc(
  NFTCollectionContractAddress: string,
  walletAddress: string,
  poolAddress: string,
) {
  const NftCollectionContract = getOriginalNFTContract(
    NFTCollectionContractAddress,
  )
  const check = await NftCollectionContract.methods
    .isApprovedForAll(walletAddress, poolAddress)
    .call()
  return check
}

export async function withdrawFunc(
  poolContractAddress: string,
  amount: number,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.withdraw(
    ethers.utils.parseEther(String(amount)),
  )
  return await transaction.wait()
}

/**
 * @description: Get the balance of the user bidding in the pool
 * @return {*}
 */
export async function getBidderInfoOfFunc(
  walletAddress: string,
  contractAddress: string = process.env.NEXT_PUBLIC_FL_CONTRACT_ADR,
) {
  try {
    const contract = getPoolContract(contractAddress)
    const balanceInfo = await contract.methods
      .getBidderInfoOf(walletAddress)
      .call()
    return balanceInfo
  } catch (error) {
    console.log(error)
  }
}

export async function getBalanceFunc(
  walletAddress: string,
  poolContractAddress: string = '0x49b775262e272bED00B6Cf0d07a5083a7eeFe19E',
) {
  try {
    const poolContract = getPoolContract(poolContractAddress)
    const balance = await poolContract.methods
      .depositBalances(walletAddress)
      .call()
    return weiToEtherString(balance)
  } catch (error) {
    console.log(error)
  }
}

export async function getOffersFunc(poolContractAddress: string) {
  const poolContract = getPoolContract(poolContractAddress)
  const offers = await poolContract.methods.getOffers().call()
  return offers
}

export async function getOffersFromBidderFunc(
  poolAddress: string,
  walletAddress: string,
) {
  try {
    const factoryContract = getFactoryContract()
    const offers = await factoryContract.methods
      .getOffersFromBidder(poolAddress, walletAddress)
      .call()
    return offers
  } catch (error) {
    console.log(error)
  }
}

export async function acceptOfferFunc(poolContractAddress: string) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.acceptOffer()
  return await transaction.wait()
}

export async function cancelOfferFunc(
  poolContractAddress: string,
  offerId: string,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.cancelOffer(offerId)
  return await transaction.wait()
}

export async function checkIfAddressIsWhitelistedFunc(address: string) {
  try {
    const factoryContract = getFactoryContract()
    return await factoryContract.methods.whiteListMap(address).call()
  } catch (error) {
    console.error(error)
  }
}

export async function getTokensOwnedByAddressFunc(address: string) {
  try {
    const factoryContract = getFactoryContract()
    return await factoryContract.methods.ownerToTokenIdMap(address).call()
  } catch (error) {
    console.error(error)
  }
}

export async function upgradeFunc(
  poolContractAddress: string,
  tokenID: string,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.upgrade(tokenID)
  return await transaction.wait()
}

export async function checkIfUserHasMintedFreeLicenseFunc(
  poolContractAddress: string,
  address: string,
) {
  const owners = await getLicenseOwnerListFunc(poolContractAddress)
  return owners.includes(address.toLowerCase())
}

//get staked info array
export async function getStakedInfoArrayFunc(poolContractAddress: string) {
  const poolContract = getPoolContract(poolContractAddress)
  return await poolContract.methods.getStakedInfoArray().call()
}

export async function getHighestOfferFunc(poolContractAddress: string) {
  const poolContract = getPoolContract(poolContractAddress)
  const balance = await poolContract.methods.highestOffer().call()
  return weiToEtherString(balance)
}

export async function getSubscriptionFeeFunc(poolContractAddress: string) {
  const poolContract = getPoolContract(poolContractAddress)
  const balance = await poolContract.methods.highestOffer().call()
  return weiToEtherString(String(Number(balance) * 0.01 * 30))
}

// https://docs.ethers.org/v5/troubleshooting/errors/#help-NUMERIC_FAULT-overflow
// In general, numbers should be kept as strings
export async function makeOfferFunc(
  poolContractAddress: string,
  amount: string,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.makeOffer({
    value: ethers.utils.parseEther(amount),
  })
  return await transaction.wait()
}

// https://docs.alchemy.com/reference/getnftmetadata
export async function getNFTCollectionMetadata(NFTCollectionAddress: string) {
  const alchemy2 = new Alchemy(settings)
  const data = await alchemy2.nft.getNftMetadata(NFTCollectionAddress, '0')
  return {
    name:
      data?.contract?.openSea?.collectionName ||
      data?.contract?.name ||
      data?.rawMetadata?.name ||
      data?.title,
    description:
      data?.contract?.openSea?.description || data?.rawMetadata?.description,
    image:
      data?.contract?.openSea?.imageUrl ||
      data?.media[0]?.thumbnail ||
      data?.rawMetadata?.image,
    title: data?.title,
  }
}

export let web3Modal: any
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true,
    providerOptions, // required
  })
}

type StateType = {
  provider?: any
  web3Provider?: any
  address?: string
  chainId?: number
}

type ActionType =
  | {
      type: 'SET_WEB3_PROVIDER'
      provider?: StateType['provider']
      web3Provider?: StateType['web3Provider']
      address?: StateType['address']
      chainId?: StateType['chainId']
    }
  | {
      type: 'SET_ADDRESS'
      address?: StateType['address']
    }
  | {
      type: 'SET_CHAIN_ID'
      chainId?: StateType['chainId']
    }
  | {
      type: 'RESET_WEB3_PROVIDER'
    }

export const initialState: StateType = {
  provider: null,
  web3Provider: null,
  address: '',
  chainId: null,
}

export function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_WEB3_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      }
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.address,
      }
    case 'SET_CHAIN_ID':
      return {
        ...state,
        chainId: action.chainId,
      }
    case 'RESET_WEB3_PROVIDER':
      return initialState
    default:
      throw new Error()
  }
}

export async function getAllOwnedNFTs(address: any) {
  try {
    const nftsForOwner = await getOwnedNFTsMyNFT(address)
    return nftsForOwner
  } catch (error) {
    console.error(error)
  }
}

export async function getOwnedNFTs(contractAddress: any) {
  try {
    const nftsForOwner = await getNftsForOwner(alchemy, contractAddress)
    const result = []

    for (let i = 0; i < nftsForOwner.ownedNfts.length; i++) {
      let media
      try {
        const res = await axios.get(
          nftsForOwner.ownedNfts[i].tokenUri?.gateway ?? '',
        )
        if (res) media = res
      } catch (error) {
        console.error(error)
      }

      result.push({
        contractAddress: nftsForOwner.ownedNfts[i].contract.address,
        tokenId: nftsForOwner.ownedNfts[i].tokenId,
        image: media?.data?.image,
        tokenUri: nftsForOwner.ownedNfts[i].tokenUri,
        title:
          nftsForOwner.ownedNfts[i].title +
          ' No.' +
          nftsForOwner.ownedNfts[i].tokenId,
        derivativeContract: '',
      })
    }
    return result
  } catch (error) {
    console.error(error)
  }
}

const getNftsForOwnerCustom = async ({
  address,
  pageKey,
}: {
  address: string
  pageKey?: string | undefined
}) => {
  const response = await axios.get(
    //TODO - in production !== should be === to fetch from mainnet
    pageKey
      ? `https://eth-${
          process.env.NEXT_PUBLIC_ENV === 'development' ? 'goerli' : 'mainnet'
        }.g.alchemy.com/nft/v2/${
          process.env.NEXT_PUBLIC_ALCHEMY_KEY
        }/getNFTs?owner=${address}&pageKey=${pageKey}&pageSize=100&withMetadata=true`
      : `https://eth-${
          process.env.NEXT_PUBLIC_ENV === 'development' ? 'goerli' : 'mainnet'
        }.g.alchemy.com/nft/v2/${
          process.env.NEXT_PUBLIC_ALCHEMY_KEY
        }/getNFTs?owner=${address}&pageSize=100&withMetadata=true`,
  )

  return response.data
}

export async function getOwnedNFTsMyNFT(address: any) {
  try {
    const result = []
    // pageKey
    let pageKey
    let loadFlag = true
    let nftsForOwner
    while (loadFlag) {
      if (pageKey == undefined) {
        nftsForOwner = await getNftsForOwnerCustom({ address })
      } else {
        const GetNftsForOwnerOptions: {
          pageKey: string | undefined
        } = {
          pageKey,
        }
        nftsForOwner = await getNftsForOwnerCustom({
          address,
          pageKey: GetNftsForOwnerOptions.pageKey,
        })
      }
      loadFlag = false
      if (nftsForOwner) {
        if (nftsForOwner.pageKey !== undefined) {
          loadFlag = true
          // eslint-disable-next-line prefer-destructuring
          pageKey = nftsForOwner.pageKey
        }

        for (let i = 0; i < nftsForOwner.ownedNfts.length; i++) {
          let imageUrl = ''
          if (
            nftsForOwner.ownedNfts[i].contractMetadata.tokenType !== 'ERC721'
          ) {
            continue
          }

          if (nftsForOwner.ownedNfts[i].title === '') {
            continue
          }

          if (nftsForOwner.ownedNfts[i].media) {
            imageUrl = nftsForOwner.ownedNfts[i].media[0].raw ?? ''
          } else {
            imageUrl = nftsForOwner.ownedNfts[i].media[0].gateway ?? ''
          }

          const tokenIdHex = nftsForOwner.ownedNfts[i].id.tokenId

          result.push({
            contractAddress: nftsForOwner.ownedNfts[i].contract.address,
            tokenId: parseInt(tokenIdHex, 16),

            image: imageUrl,
            tokenUri:
              nftsForOwner.ownedNfts[i].tokenUri.gateway ??
              nftsForOwner.ownedNfts[i].tokenUri.raw ??
              '',
            title: nftsForOwner.ownedNfts[i].title,
            collectionDetails: {
              name: nftsForOwner.ownedNfts[i].contractMetadata.name,
              tokenType: nftsForOwner.ownedNfts[i].contractMetadata.tokenType,
              isVerifiedOnOpensea:
                nftsForOwner.ownedNfts[i].contractMetadata.openSea
                  .safelistRequestStatus === 'approved'
                  ? true
                  : false,
              floorPrice:
                nftsForOwner.ownedNfts[i].contractMetadata.openSea.floorPrice,
            },
            derivativeContract: '',
          })
        }
      }
    }

    return result
  } catch (error) {
    console.error(error)
  }
}

export async function splitToCommercializationLists(nfts: NFT[]) {
  try {
    const availableNfts: NFT[] = []
    const commercializedNfts: NFT[] = []

    await Promise.allSettled(
      nfts?.map(async (nft, index) => {
        const DELAY = 200
        await sleep(index * DELAY)
        const contractAddress = await getDerivativeNFTContractAddress(
          nft.contractAddress,
          nft.tokenId,
        )

        const isPass = await isPassNft(nft)
        if (Number(contractAddress) != Number(0)) {
          nft.derivativeContract = contractAddress
          commercializedNfts.push(nft)
        } else if (isPass) {
          const stakedNfts = await getOwnedNFTs(nft.contractAddress)
          if (stakedNfts) {
            for (const stakedNft of stakedNfts) {
              stakedNft.derivativeContract = nft.contractAddress ?? ''
              commercializedNfts.push(stakedNft)
            }
          }
        } else {
          availableNfts.push(nft)
        }
      }),
    )
    return { availableNfts, commercializedNfts }
  } catch (error) {
    console.error(error)
  }
}

export async function newSplitToCommercializationListsV1(nfts: NFT[]) {
  try {
    const availableNfts: NFT[] = []
    const commercializedNfts: NFT[] = []

    const factoryContract = getFactoryContract()
    const nftDeployInfo: NftDeployInfoType[] = await factoryContract.methods
      .getNFTPoolInfo()
      .call()

    await Promise.allSettled(
      nfts?.map(async (nft, index) => {
        //Nft only commercialized not yet stake
        const nftNotYetStaked = nftDeployInfo.filter((item) => {
          if (
            item.originalContractAddress.toLocaleLowerCase() ===
            nft?.contractAddress
          )
            return item
        })
        if (nftNotYetStaked.length > 0) {
          const updateNFT = {
            ...nft,
            derivativeContract:
              nftNotYetStaked[0].derivativeContractAddress.toLocaleLowerCase(),
          }
          commercializedNfts.push(updateNFT)
        } else {
          availableNfts.push(nft)
        }
      }),
    )

    return { availableNfts, commercializedNfts }
  } catch (error) {
    console.error(error)
  }
}

// if the given NFT is not commercialized return the deployed Derivative NFT collection contract address.
// if the given NFT is not commercialized, return "0x00000..00"
export async function getDerivativeNFTContractAddress(
  originalNFTContractAddress: any,
  originNFTTokenID: any,
) {
  try {
    const factoryContract = getFactoryContract()
    return await factoryContract.methods
      .getContractAddress(originalNFTContractAddress, originNFTTokenID)
      .call()
  } catch (error) {
    console.error(error)
  }
}

// Original NFT contract
// const getOriginalNFTContract = (originalContractAddress: string) => {
//   return new web3.eth.Contract(OriginNFT.abi, originalContractAddress)
// }

export async function isPassNft(nft: any) {
  try {
    const stakedInfo = await getStakedTokenInfo(nft.contractAddress)
    return (
      Number(stakedInfo.originalContractAddress) != Number(0) &&
      Number(nft.tokenId) == Number(0)
    )
  } catch (error) {
    console.error(error)
  }
}

export async function getStakedTokenInfo(derivativeContract: any) {
  try {
    const factoryContract = getFactoryContract()
    return await factoryContract.methods
      .getStakedTokenInfo(derivativeContract)
      .call()
  } catch (error) {
    console.error(error)
  }
}

// Only get mint types that are available for sale
export async function getAllMintTypes(
  poolContractAddress: string,
  availableForSaleOnly = false,
) {
  try {
    const derivativeNFTContract = getPoolContract(poolContractAddress)
    const mintTypes = await derivativeNFTContract.methods
      .getAllMintTypes()
      .call()

    const convertMintTypes: any = []

    await Promise.allSettled(
      mintTypes?.map(async (mintType: any, index: number) => {
        let media
        try {
          try {
            const res = await axios.get(mintType.mediaUri)
            if (res) media = res
          } catch (error) {
            console.error(error)
          }
          const item = {
            image: media?.data?.image,
            mediaUri: mintType.mediaUri,
            title: mintType.jsonName,
            description: mintType.jsonDescription,
            price: weiToEtherString(mintType.mintPrice),
            remaining:
              Number(mintType.totalLicenses) - Number(mintType.soldLicenses),
            currency: 'ETH',
            total: mintType.totalLicenses,
            mintType: mintType.id,
            expDuration: timeFromNow(
              moment().add(mintType.validDuration, 'second'),
            ),
            isSaleEnabled: mintType.isSaleEnabled,
          }
          if (availableForSaleOnly) {
            if (
              mintType.isSaleEnabled &&
              Number(mintType.totalLicenses) - Number(mintType.soldLicenses) > 0
            ) {
              convertMintTypes.push(item)
            }
          } else {
            convertMintTypes.push(item)
          }
        } catch (error) {
          console.error(error)
        }
      }),
    )

    return convertMintTypes
  } catch (error) {
    console.error(error)
  }
}

export async function getMintType(
  poolContractAddress: string,
  mintType: number,
) {
  try {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions, // required
    })
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const contract = new ethers.Contract(
      poolContractAddress,
      PoolContractABI,
      signer,
    )
    const nft = await contract.getMintType(mintType)

    return nft
  } catch (error) {
    console.error(error)
  }
}

export async function getNFT(nftAddress: any, nftToken: any) {
  try {
    const metadata = await getNftMetadata(alchemy, nftAddress, nftToken)
    return { metadata, network }
  } catch (error) {
    console.error(error)
  }
}

export async function getOriginalNFT(poolContractAddress: string) {
  try {
    const derivativeNFTContract = getPoolContract(poolContractAddress)
    const originNFTAddress = await derivativeNFTContract.methods
      .originNFTAddress()
      .call()

    const originNFTTokenId = await derivativeNFTContract.methods
      .originNFTTokenID()
      .call()

    const originalNFTContract = getOriginalNFTContract(originNFTAddress)

    let calcRemainTime = 0

    //Get Original NFT name and metadata
    const originalNFTName = await originalNFTContract.methods.name().call()
    let nftMetadata
    await getNFT(originNFTAddress, originNFTTokenId).then((info) => {
      nftMetadata = {
        title: info?.metadata.title ? info?.metadata.title : 'No title',
        address: originNFTAddress,
        tokenId: originNFTTokenId,
        image: info?.metadata.rawMetadata?.image,
        name: originalNFTName,
        totalLicences: 100,
        expirationRemaining: generateTimeString(calcRemainTime),
        tokenUri: info?.metadata.tokenUri?.gateway,
      }
    })

    return nftMetadata
  } catch (error) {
    console.error(error)
  }
}

export async function getApprovalStatus(
  originNFTAddress: any,
  originNFTTokenId: any,
  poolContractAddress: string,
) {
  try {
    const originalNFTContract = getOriginalNFTContract(originNFTAddress)
    const ownerAddress = await originalNFTContract.methods
      .ownerOf(originNFTTokenId)
      .call()

    return await originalNFTContract.methods
      .isApprovedForAll(ownerAddress, poolContractAddress)
      .call()
  } catch (error) {
    console.error(error)
  }
}

export async function isStaked(
  originalNFTContractAddress: string,
  originalNFTTokenId: string,
  poolContractAddress: string,
) {
  try {
    const originalNFTContract = getOriginalNFTContract(
      originalNFTContractAddress,
    )
    const ownerOfOriginNFT = await originalNFTContract.methods
      .ownerOf(originalNFTTokenId)
      .call()
    return Number(ownerOfOriginNFT) == Number(poolContractAddress)
  } catch (error) {
    console.error(error)
  }
}

export async function getPassNFT(poolContractAddress: string) {
  try {
    const derivativeNFTContract = getPoolContract(poolContractAddress)

    const passNFTAddress = await derivativeNFTContract.methods
      .passNFTAddress()
      .call()
    const passNFTTokenId = await derivativeNFTContract.methods
      .passNFTTokenID()
      .call()
    let result
    await getNFT(poolContractAddress, '0').then((info) => {
      result = {
        address: passNFTAddress,
        tokenId: passNFTTokenId,
        image: info?.metadata.rawMetadata?.image,
        title: `${info?.metadata?.title ? info?.metadata?.title : 'No title'} `,
        remaining: 1,
        mediaUri: info?.metadata?.tokenUri?.gateway ?? '',
      }
    })

    return result
  } catch (error) {
    console.error(error)
  }
}

export async function isSaleEnabled(poolContractAddress: string) {
  try {
    const derivativeNFTContract = getPoolContract(poolContractAddress)
    const saleEnabled = await derivativeNFTContract.methods.saleEnabled().call()
    return saleEnabled === true
  } catch (error) {
    console.error(error)
  }
}

export async function approve(
  originalNFTContract: string,
  poolContractAddress: string,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    originalNFTContract,
    OriginNFT.abi,
    signer,
  )

  const transaction = await contract.setApprovalForAll(
    poolContractAddress,
    true,
  )
  const receipt = await transaction.wait()
  return receipt
}

export async function unstake(poolContractAddress: string) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )

  const transaction = await contract.unstake()
  const receipt = await transaction.wait()
  return receipt
}

export async function addMintType(
  poolContractAddress: string,
  name: string,
  price: number,
  licenseDuration: number,
  description: string,
  totalLicenses: number,
  mediaUri: string,
  enableSale: boolean,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )

  price = Web3.utils.toWei(price.toString())
  const transaction = await contract.addMintType(
    totalLicenses,
    price,
    name,
    description,
    mediaUri,
    licenseDuration,
    enableSale,
    {
      gasLimit: 1000000,
    },
  )
  const receipt = await transaction.wait()

  if (receipt.status == 1) {
    return receipt
  }
}

export async function stake(poolContractAddress: string) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )

  const transaction = await contract.stake()
  const receipt = await transaction.wait()
  return receipt
}

/////
/// getDeployedLicenseAddress
/////
export async function getDeployedLicenseAddress() {
  try {
    const factoryContract = getFactoryContract()
    const rs = await factoryContract.methods.getDeployedLicenseAddress().call()

    return rs
  } catch (error) {
    console.error(error)
  }
}

// getDerivativeNFTContractAddress
// not using anymore
export async function oldGetALlNFTAndLicense() {
  try {
    const factoryContract = getFactoryContract()
    const nfts = await factoryContract.methods.getOriginalNFTInfo().call()
    const convertNFTs: any = []

    //Get metadata of original NFT

    if (nfts) {
      await Promise.allSettled(
        nfts?.map(async (nft: any, index: number) => {
          let image = ''
          let title = ''

          const originNFTTokenId = nfts[index].tokenId
          const { originalContractAddress } = nfts[index]
          await getNFT(originalContractAddress, originNFTTokenId).then(
            (info) => {
              image = info?.metadata.rawMetadata?.image
                ? String(info?.metadata.rawMetadata?.image)
                : String(info?.metadata.tokenUri?.gateway)
              title = info?.metadata.title ?? ''
            },
          )
          const object = {
            image,
            title,
            tokenId: originNFTTokenId,
            originalContractAddress,
            derivativeContractAddress: nft?.derivativeContractAddress,
          }
          convertNFTs.push(object)
        }),
      )
    }
    //Get MinTypes of original NFT have commercialize
    const allMintTypes: any = []
    if (convertNFTs) {
      await Promise.allSettled(
        convertNFTs.map(async (nft: any, index: number) => {
          const DELAY = 200
          await sleep(index * DELAY)
          const poolContractAddress = nft?.derivativeContractAddress
          const mintTypes = await getAllMintTypes(poolContractAddress)
          const addContract = mintTypes?.map((item: any) => ({
            ...item,
            poolContractAddress,
          }))

          allMintTypes.push(...addContract)

          nft.mintTypes = mintTypes
        }),
      )
    }

    return { derivativeNFTs: convertNFTs, allMintTypes }
  } catch (error) {
    console.error(error)
  }
}

// export async function mintItem(
//   poolContractAddress: string,
//   mintType: number,
//   price: string,
// ) {
//   const web3Modal = new Web3Modal({
//     cacheProvider: true,
//     providerOptions, // required
//   })
//   const provider = await web3Modal.connect()
//   const library = new ethers.providers.Web3Provider(provider)
//   const signer = library.getSigner()
//   const contract = new ethers.Contract(
//     poolContractAddress,
//     PoolContractABI,
//     signer,
//   )
//   const transaction = await contract.mintItem(mintType, { value: price })

//   await transaction.wait()

//   return transaction.nonce
// }

export async function enableSale(poolContractAddress: string, id: number) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.enableSale(id)
  const receipt = await transaction.wait()
  return receipt
}

export async function disableSale(poolContractAddress: string, id: number) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )
  const transaction = await contract.disableSale(id)
  const receipt = await transaction.wait()
  return receipt
}

export async function modify(
  poolContractAddress: string,
  name: string,
  description: string,
  mediaUri: string,
  id: number,
) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )

  const transaction = await contract.updateMintType(
    id,
    name,
    description,
    mediaUri,
  )

  const receipt = await transaction.wait()

  return receipt
}

export async function collect(poolContractAddress: string, tokenId: number) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )

  const transaction = await contract.receivePayable(tokenId)

  const receipt = await transaction.wait()

  return receipt
}

export async function collectAll(poolContractAddress: string) {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  })
  const provider = await web3Modal.connect()
  const library = new ethers.providers.Web3Provider(provider)
  const signer = library.getSigner()
  const contract = new ethers.Contract(
    poolContractAddress,
    PoolContractABI,
    signer,
  )

  const transaction = await contract.receiveAllPayable()

  const receipt = await transaction.wait()

  return receipt
}

export async function getTokenListInfo(poolContractAddress: string) {
  try {
    const derivativeNFTContract = getPoolContract(poolContractAddress)

    const getTokenInfoList = await derivativeNFTContract.methods
      .getTokenInfoList()
      .call()

    const tokenInfoList = getTokenInfoList.filter(
      (item: any) => Number(item?.contractAddress) != Number(0),
    )

    let convertTokenInfoList: any = []

    await Promise.allSettled(
      tokenInfoList?.map(async (token: any, index: number) => {
        let media
        try {
          const res = await axios.get(token?.mediaUri)
          if (res) media = res
        } catch (error) {
          console.error(error)
        }
        convertTokenInfoList.push({
          ...token,
          image: media?.data?.image,
        })
      }),
    )

    return convertTokenInfoList
  } catch (error) {
    console.error(error)
  }
}

export async function collectionMaxExpTime(poolContractAddress: string) {
  try {
    const derivativeNFTContract = getPoolContract(poolContractAddress)

    const collectionMaxExpTime = await derivativeNFTContract.methods
      .collectionMaxExpTime()
      .call()

    return collectionMaxExpTime
  } catch (error) {
    console.error(error)
  }
}

export async function getAllMintedLicenses(address: string) {
  try {
    const factoryContract = getFactoryContract()

    const allMintedLicenses = await factoryContract.methods
      .getAllMintedLicenses(address)
      .call()

    let convertAllMinted: any = []
    await Promise.allSettled(
      allMintedLicenses
        ?.filter(
          (license: any) =>
            license.contractAddress !==
            '0x0000000000000000000000000000000000000000',
        )
        ?.map(async (token: any, index: number) => {
          let media
          try {
            const res = await axios.get(token?.mediaUri)
            if (res) media = res
          } catch (error) {
            console.error(error)
          }

          convertAllMinted.push({
            image: media?.data?.image,
            mediaUri: token.mediaUri,
            contractAddress: token.contractAddress,
            expTime: token.expTime,
            mintType: token.id,
            tokenId: token.tokenId,
            mintPrice: weiToEtherString(token.mintPrice),
            mintTypeName: token.mintTypeName,
          })
        }),
    )

    return convertAllMinted
  } catch (error) {
    console.error(error)
  }
}

export async function tokenInfo(poolContractAddress: string, tokenID: string) {
  try {
    const derivativeNFTContract = getPoolContract(poolContractAddress)

    const tokenData = await derivativeNFTContract.methods
      .tokenInfoMap(tokenID)
      .call()

    let media
    try {
      const res = await axios.get(tokenData?.mediaUri)
      if (res) media = res
    } catch (error) {
      console.error(error)
    }

    const tokenInfo = {
      contractAddress: tokenData.contractAddress,
      tokenId: tokenData.tokenId,
      expTime: Number(tokenData.expTime),
      mintType: tokenData.mintType,
      mintPrice: weiToEtherString(tokenData.mintPrice),
      image: media?.data?.image,
      mintTypeName: tokenData.mintTypeName,
      createdAt: Number(tokenData.createdAt),
      jsonDescription: tokenData.jsonDescription,
    }

    return tokenInfo
  } catch (error) {
    console.error(error)
  }
}

export async function getDetailLicense(
  poolContractAddress: string,
  tokenId: string,
) {
  try {
    let mintTypeConvert: any
    const derivativeNFTContract = getPoolContract(poolContractAddress)

    const token = await derivativeNFTContract.methods
      .mintTypeInfoArray(tokenId)
      .call()

    let media
    try {
      const res = await axios.get(token?.mediaUri)
      if (res) media = res
    } catch (error) {
      console.error(error)
    }

    if (token) {
      mintTypeConvert = {
        image: media?.data?.image,
        mediaUri: token?.mediaUri,
        title: token?.jsonName,
        description: token?.jsonDescription,
        price: weiToEtherString(token?.mintPrice),
        remaining: Number(token?.totalLicenses) - Number(token?.soldLicenses),
        currency: 'ETH',
        total: token?.totalLicenses,
        mintType: token?.id,
        expDuration: convertValidDurationToString(Number(token?.validDuration)),
        isSaleEnabled: token?.isSaleEnabled,
        poolContractAddress,
      }
    }

    return mintTypeConvert
  } catch (error) {
    console.error(error)
  }
}

export async function getMyLicenseWeb3(address: string) {
  try {
    const allDeployedLicenseAddress = await getDeployedLicenseAddress()
    const convertAllDeployedLicenseAddress = allDeployedLicenseAddress?.map(
      (item: string) => item.toLowerCase(),
    )

    const allMyNFTs = await getAllOwnedNFTs(address)

    const myLicenses = allMyNFTs?.filter((nft) =>
      convertAllDeployedLicenseAddress.includes(nft.contractAddress),
    )

    let myLicensesHaveTokenInfo: any = []
    if (myLicenses) {
      await Promise.allSettled(
        myLicenses?.map(async (nft, index) => {
          const res = await tokenInfo(nft.contractAddress, nft.tokenId)
          myLicensesHaveTokenInfo.push(res)
        }),
      )
    }

    const updateRecent = myLicensesHaveTokenInfo?.sort(function (
      left: any,
      right: any,
    ) {
      return moment.utc(right.createdAt).diff(moment.utc(left.createdAt))
    })
    const updateData = updateRecent?.map((item) => {
      const expTime = moment
        .unix(Number(item?.expTime))
        .format('YYYY-MM-DD[T]HH:mm[Z]')
      const now = moment().format('YYYY-MM-DD[T]HH:mm[Z]')

      const isActive = moment(expTime).isAfter(now)

      return { ...item, isActive }
    })

    return updateData
  } catch (error) {
    console.error(error)
  }
}

export async function getNFTOwner(poolContractAddress: string, nft: any) {
  let nftOwner
  try {
    if (poolContractAddress !== undefined) {
      const owners = await getOwnersForNft(
        alchemy,
        poolContractAddress,
        nft.tokenId,
      )
      nftOwner = owners?.owners[0]
    }
    return nftOwner
  } catch (error) {
    console.error(error)
  }
}

export async function getNFTOwnerV1(
  poolContractAddress: string,
  tokenId: string,
) {
  let nftOwner
  try {
    if (poolContractAddress !== undefined) {
      const owners = await getOwnersForNft(
        alchemy,
        poolContractAddress,
        tokenId,
      )
      nftOwner = owners?.owners[0]
    }
    return nftOwner
  } catch (error) {
    console.error(error)
  }
}

export async function checkIsOwner(poolContractAddress: string) {
  try {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions, // required
    })
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const owner = await signer.getAddress()
    const lowercaseOwner = owner.toLowerCase()

    if (owner !== undefined && poolContractAddress !== undefined) {
      const originalNFT = await getOriginalNFT(poolContractAddress)

      const passNFT: any = await getPassNFT(poolContractAddress)

      // const originalNFTOwner = await getNFTOwner(
      //   poolContractAddress,
      //   originalNFT
      // );

      const passNFTOwner = await getNFTOwner(poolContractAddress, passNFT)

      if (Number(passNFT?.address) === Number(0)) {
        // if (originalNFTOwner === lowercaseOwner) {
        return true
        // }
      } else {
        if (passNFTOwner === lowercaseOwner) {
          return true
        }
      }
    }
    return false
  } catch (error) {
    console.error(error)
  }
  return false
}

export async function getAllMintTypesByAddress(ids: string[]) {
  try {
    const allMintTypesByAddress: any = []

    if (allMintTypesByAddress) {
      await Promise.allSettled(
        ids.map(async (id: string, index: number) => {
          const DELAY = 200
          await sleep(index * DELAY)
          const mintTypes = await getAllMintTypes(id)
          const updatedMintType = mintTypes?.map((item: any) => ({
            ...item,
            poolContractAddress: id,
          }))
          allMintTypesByAddress.push(...updatedMintType)
        }),
      )
    }
    return allMintTypesByAddress
  } catch (e) {
    console.log(e, 'error getAllMintTypesByAddress')
  }
}

export async function getTokenListInfoByAddress(ids: string[]) {
  try {
    let allTokenListInfoByAddress: any = []
    if (allTokenListInfoByAddress) {
      await Promise.allSettled(
        ids.map(async (id: string, index: number) => {
          const DELAY = 200
          await sleep(index * DELAY)
          const tokenInfo = await getTokenListInfo(id)
          allTokenListInfoByAddress.push(...tokenInfo)
        }),
      )
    }

    return allTokenListInfoByAddress
  } catch (error) {
    console.error(error)
  }
}

export async function getOriginalNFTAddressAndTokenId(
  poolContractAddress: string,
) {
  try {
    const derivativeNFTContract = getPoolContract(poolContractAddress)
    const originNFTAddress = await derivativeNFTContract.methods
      .originNFTAddress()
      .call()

    const originNFTTokenId = await derivativeNFTContract.methods
      .originNFTTokenID()
      .call()

    const originNFT = {
      address: originNFTAddress,
      tokenId: originNFTTokenId,
    }

    return originNFT
  } catch (error) {
    console.error(error)
  }
}

export async function getExchangeRateFunc(
  TokenConverterContractAddress: string = '0xADb0267c6AB295128D565ee8e5593D8749ec4ef7',
) {
  try {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
    })
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const signer = library.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(
      TokenConverterContractAddress,
      TokenConverterABI,
      signer,
    )
    const amount = await contract.exchangeRate()

    return Number(amount)
  } catch (error) {
    console.error(error)
  }
}
