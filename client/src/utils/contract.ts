import axios from 'axios'
import { ethers } from 'ethers'

export interface ContractInfo {
  abi: any[]
  networks: {
    [networkId: string]: {
      address: string
    }
  }
}

let contractInfo: any = null

export async function loadContractInfo(): Promise<ContractInfo> {
  if (!contractInfo) {
    try {
      const response = await axios.get('/RedPacket.json')
      contractInfo = response.data
    }
    catch (error) {
      console.error('Failed to load contract info:', error)
      throw error
    }
  }
  return contractInfo
}

export async function getContract() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contractInfo = await loadContractInfo()
  const networkId = '11155111'

  const contractAddress = contractInfo.networks[networkId].address
  const contract = new ethers.Contract(contractAddress, contractInfo.abi, signer)

  return contract
}

export async function getReadOnlyContract() {
  const contractInfo = await loadContractInfo()
  const networkId = '11155111'

  // 使用Ganache的RPC端点创建只读provider
  const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${import.meta.env.VITE_PROJECT_ID}`,
  )

  console.log(import.meta.env)

  const contractAddress = contractInfo.networks[networkId].address
  const contract = new ethers.Contract(contractAddress, contractInfo.abi, provider)

  return contract
}
