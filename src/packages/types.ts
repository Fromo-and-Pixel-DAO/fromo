import { PropsWithChildren } from 'react'
// init
export const initPassNFT = {
  address: '',
  tokenId: '',
  image: '',
  title: '',
  mediaUri: '',
  remaining: 0,
}

export const initLicenseDuration = {
  value: 0,
  name: '',
  expDuration: '',
}

export const initOriginalNft = {
  title: '',
  address: '',
  tokenId: '',
  image: '',
  name: '',
  totalLicences: 0,
  expirationRemaining: '',
}

export const initModifyMint = {
  name: '',
  description: '',
  mediaUri: '',
  mintType: 0,
}

export const initMintType = {
  image: '',
  title: '',
  description: '',
  price: '',
  remaining: 0,
  currency: '',
  total: 0,
  mintType: 0,
  expDuration: '',
  isSaleEnabled: false,
}

export const initToken = {
  contractAddress: '',
  expTime: '',
  mediaUri: '',
  mintPrice: '',
  mintType: '',
  tokenId: '',
  mintTypeName: '',
  image: '',
  createdAt: 0,
}

// Type
export type MinType = {
  image: string
  title: string
  description: string
  price: string
  remaining: number
  currency: string
  total: number
  mintType: number
  expDuration: string
  derivativeNFTContractAddress?: string
  isSaleEnabled: boolean
  mediaUri?: string
  nameForSearch?: string
}

export type PassNftType = {
  address: string
  tokenId: string
  image: string
  title: string
  remaining: number
  mediaUri: string
}

export type OriginalNftType = {
  title: string
  address: string
  tokenId: string
  image: string
  name: string
  totalLicences: number
  expirationRemaining: string
  tokenUri?: string
}

export type AddMintTypeInputs = {
  name: string
  price: number
  remainQuantity: number
  validTime: number
  description: string
  mediaUri: string
  enableSale: boolean
}

export type ModifyMintTypeInputs = {
  name: string
  description: string
  mediaUri: string
  mintType: number
}

export type DerivativeNFT = {
  index?: number
  title?: string
  tokenId: string
  originalContractAddress: string
  image: string
  mintTypes?: MinType[]
  derivativeContractAddress?: string
  name?: string
  sort?: string
}

export type Attribute = {
  trait_type: string
  value: string
  percentTrait?: number
}

export type MetadataDetail = {
  contractAddress: string
  tokenId: string
  tokenStandard: string
  blockChain: string
  metadata: string
}

export type MetadataType = {
  image: string
  description?: string
  title?: string
  properties?: any[]
  details?: MetadataDetail
}

export type TokenInfo = {
  contractAddress: string
  expTime: string
  mediaUri: string
  mintPrice: string
  mintType: string
  tokenId: string
  mintTypeName?: string
  image?: string
  createdAt: number
}

export type NftDeployInfoType = {
  derivativeContractAddress: string
  originalContractAddress: string
}

export type LicenseDuration = {
  value: number
  name: string
  expDuration: string
}

export type MintTypeInfoType = {
  totalLicenses: string
  soldLicenses: string
  mintPrice: string
  jsonName: string
  jsonDescription: string
  mediaUri: string
  id: string
  validDuration: string
  maxExpTime: string
  isSaleEnabled: boolean
}

///Enum

export enum MenuEnum {
  all = 'all',
  onSale = 'onSale',
}

export enum MenuMyLicenseEnum {
  recent = 'recent',
  endingSoon = 'endingSoon',
  highPrice = 'highPrice',
  lowPrice = 'lowPrice',
}

export enum GalleryTabs {
  nft = 'nft',
  license = 'license',
}

export enum MyNftTabs {
  myNft = 'myNft',
  manage = 'manage',
}

export type Colors = 'white' | 'black' | 'brown' | 'gray' | 'grey' | 'darkGrey'
export type ButtonColors = 'brown' | 'default' | 'gray'

export type ReactFCWithChildren<T = unknown> = React.FC<PropsWithChildren<T>>

export enum EnvTypes {
  Development = 'development',
  Production = 'production',
}

export enum StylesBackground {
  accountPage = 'accountPage',
  market = 'market',
}

export enum ViewMode {
  GRID = 'grid',
  LIST = 'list',
}

export enum Themes {
  SUCCESS_PRIMARY = 'success-primary',
  SUCCESS_SECONDARY = 'success-secondary',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  QUATERNARY = 'quaternary',
  UNLICENSED_NFTS = 'unlicensed-nfts',
  LICENSED_NFTS = 'license-nfts',
  LICENSE = 'license',
  COLLECTION_MARKET = 'collection-market',
  LICENSE_MARKET = 'license-market',
  MINT_TYPE = 'mint-type',
  TOKEN = 'token',
}

export enum MarketType {
  COLLECTIONS = 'collections',
  MINION = 'minion',
}

export enum PoolType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum ErrorMetamask {
  ACTION_REJECTED = 'ACTION_REJECTED',
}

export enum MyAccountTabs {
  ACCOUNT = 'myNFT',
  BUY = 'buy',
  SELL = 'sell',
}

export enum MyDividendsTabs {
  UNCLAIMED = 'Unclaimed',
  CLAIMED = 'Claimed',
}

export enum MarketTabs {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum DetailItemTabs {
  STAKED = 'Staked',
  MYNFTS = 'MyNFTs',
}

export enum DetailPoolRightTabs {
  OFFERS = 'offers',
  NORMAL_LICENSE = 'normal-license',
  FIXED_LICENSE = 'fixed-license',
}

export enum MyNFTsTabs {
  UNLICENSED_NFT = 'unlicensed-nft',
  LICENSED_NFT = 'licensed-nft',
}

export enum LicensesPoolTabs {
  NORMAL = 'normal-license',
  FIXED_TERM = 'fixed-term-license',
}

export enum FilterMarket {
  COLLECTIONS = 'collections',
  LICENSE_DURATION = 'licenseDuration',
  IS_SALE = 'isSale',
  PRICE = 'price',
}

export enum PathnameType {
  MARKET = '/',
}

export enum PathProfileType {
  PROFILE = '/profile',
  AUCTIONS = '/profile/auctions',
  PARTICIPATION = '/profile/participation',
}
