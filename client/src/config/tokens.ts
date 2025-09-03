import type { Address } from 'viem'
import { localhost, mainnet, sepolia } from 'wagmi/chains'
import CourseRegistryABI from '@/assets/CourseRegistry.json'
import OWCTokenABI from '@/assets/OWCToken.json'

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
