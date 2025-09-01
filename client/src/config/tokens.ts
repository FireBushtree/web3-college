import { localhost, mainnet, sepolia } from 'wagmi/chains'

export const OWC_TOKEN_ADDRESSES = {
  [localhost.id]: '0xd00f0340E18Ceaa9089a7A1D0947b024D6927801',
  [sepolia.id]: '0x1234567890123456789012345678901234567890',
  [mainnet.id]: '0x1234567890123456789012345678901234567890',
} as const

export const COURSE_REGISTRY_ADDRESSES = {
  [localhost.id]: '0x642DA79e539c9fafb98E96841ad5f3141D82f77a', // TODO: Replace with deployed contract address
  [sepolia.id]: '0x0000000000000000000000000000000000000000', // TODO: Replace with deployed contract address
  [mainnet.id]: '0x0000000000000000000000000000000000000000', // TODO: Replace with deployed contract address
} as const

export const OWC_TOKEN_DECIMALS = 18
