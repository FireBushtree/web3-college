import type { Address } from 'viem'
import { mainnet, sepolia } from 'wagmi/chains'

export const OWC_TOKEN_ADDRESSES = {
  // [localhost.id]: OWCTokenABI.networks[5777].address as Address,
  [sepolia.id]: '0xF74aE851eeFb542d77581E68FE3D0dFF2C259ddC',
  [mainnet.id]: '0x1234567890123456789012345678901234567890',
} as const

export const COURSE_REGISTRY_ADDRESSES = {
  // [localhost.id]: CourseRegistryABI.networks[5777].address as Address,
  [sepolia.id]: '0xeA8A709014325a6cffD9AcDA46856A54113D7cA3',
  [mainnet.id]: '0x0000000000000000000000000000000000000000',
} as const

export const OWC_TOKEN_DECIMALS = 0

// LINK Token contract addresses
export const LINK_TOKEN_ADDRESSES = {
  // [mainnet.id]: '0x514910771AF9Ca656af840dff83E8264EcF986CA' as Address,
  [sepolia.id]: '0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5' as Address,
  // [localhost.id]: '0x779877A7B0D9E8603169DdbD7836e478b4624789' as Address,
} as const

export const LINK_A_TOKEN_ADDRESSES = {
  // [mainnet.id]: '0x514910771AF9Ca656af840dff83E8264EcF986CA' as Address,
  [sepolia.id]: '0x3FfAf50D4F4E96eB78f2407c090b72e86eCaed24' as Address,
  // [localhost.id]: '0x779877A7B0D9E8603169DdbD7836e478b4624789' as Address,
} as const

// Aave Pool contract addresses
export const AAVE_POOL_ADDRESSES = {
  [mainnet.id]: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2' as Address,
  [sepolia.id]: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as Address,
  // [localhost.id]: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as Address,
} as const

// Token configurations
export const TOKENS = {
  LINK: {
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.svg?v=029',
    addresses: LINK_TOKEN_ADDRESSES,
  },
  OWC: {
    symbol: 'OWC',
    name: 'OpenWeb3 College',
    decimals: 18,
    addresses: OWC_TOKEN_ADDRESSES,
  },
} as const
