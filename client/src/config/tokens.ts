import { localhost, mainnet, sepolia } from 'wagmi/chains'

export const OWC_TOKEN_ADDRESSES = {
  [localhost.id]: '0xd00f0340E18Ceaa9089a7A1D0947b024D6927801',
  [sepolia.id]: '0x1234567890123456789012345678901234567890',
  [mainnet.id]: '0x1234567890123456789012345678901234567890',
} as const

export const OWC_TOKEN_DECIMALS = 18
