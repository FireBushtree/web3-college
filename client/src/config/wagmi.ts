import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'web-college',
  projectId: '70f607a403893f6e1716e21965675be3',
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
