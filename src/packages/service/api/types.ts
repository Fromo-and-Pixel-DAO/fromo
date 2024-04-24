export interface IProfit {
  keys: string;
  lockedKeys: string;
  flPrice: string;
  flTokens: string;
  lockedFlTokens: string;
  withdrawalAmountTokens: string;
  keyDividends: string;
  convertedGameIds: number[];
  unconvertedGameIds: number[];
  canConvert: number;
  unclaimedKeyDividends: string;
  unclaimedKeyGameIds: number[];
  finalWinPrice: string;
  unclaimedFinalWinPrice: string;
  unclaimedFinalWinnerGameIds: number[];
  nftDividends: string;
  lockedNftDividends: string;
  unclaimedNftDividends: string;
  unclaimedNftGameIds: number[];
}

export interface IGameNft {
  gameId: number;
  name: string;
  tokenId: string;
  imageUrl: string;
  tx: string;
}

export interface IHistoricalDividendsList {
  gameNft: IGameNft;
  type: number;
  amount: string;
  status: number;
}

export interface IGameAmountNft {
  gameId: number;
  name: string;
  keyDividends: string;
  imageUrl: string;
  tx: string;
}


export interface IUserDividends {
  total: number;
  historicalDividendsList: IHistoricalDividendsList[];
}

export interface IUserRetrieved {
  total: number;
  gameNftList: IGameNft[];
}

export interface IGameNftDetail {
  gameId: number;
  name: string;
  chainName: string;
  userAddress: string;
  nftAddress: string;
  lastAddress: string;
  tokenId: string;
  imageUrl: string;
  animationUrl: string;
  tokenMetadataUrl: string;
  openSeaUrl: string;
  finalPrice: string;
  status: number;
  totalKeyMinted: string;
  biddersCount: number;
  startTimestamp: number;
  endTimestamp: number;
}

export interface INftList {
  total: number;
  nftList: IGameNftDetail[];
}

export interface ApiResponse<T> {
  msg: string;
  code: string;
  data: T;
}
