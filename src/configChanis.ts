import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: '7ea442b7812ffad6c0efcf579fdf7de1',

  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
})
