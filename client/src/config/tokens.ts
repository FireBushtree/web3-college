import { localhost, mainnet, sepolia } from 'wagmi/chains'

export const OWC_TOKEN_ADDRESSES = {
  [localhost.id]: '0xf38307b674C20f11f212B888f581d76CF0d485D3',
  [sepolia.id]: '0x1234567890123456789012345678901234567890',
  [mainnet.id]: '0x1234567890123456789012345678901234567890',
} as const

export const OWC_TOKEN_DECIMALS = 18
