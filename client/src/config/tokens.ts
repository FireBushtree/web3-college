import { localhost, mainnet, sepolia } from 'wagmi/chains'

export const OWC_TOKEN_ADDRESSES = {
  [localhost.id]: '0x0aC59E0181418D1b73058729b6d187697f73AEd8',
  [sepolia.id]: '0x1234567890123456789012345678901234567890',
  [mainnet.id]: '0x1234567890123456789012345678901234567890',
} as const

export const OWC_TOKEN_DECIMALS = 18
