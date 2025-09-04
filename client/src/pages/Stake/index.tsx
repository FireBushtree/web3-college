import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { useAccount, useBalance, useChainId, useReadContract, useWriteContract } from 'wagmi'
import Toast from '@/components/Toast'
import { AAVE_POOL_ADDRESSES, LINK_TOKEN_ADDRESSES, TOKENS } from '@/config/tokens'

// ERC20 ABI for LINK token
const ERC20_ABI = [
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Simplified Aave Pool ABI
const AAVE_POOL_ABI = [
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' },
    ],
    name: 'supply',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

function StakeCard() {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const [amount, setAmount] = useState('')
  const [isApproving, setIsApproving] = useState(false)
  const [isStaking, setIsStaking] = useState(false)

  // Toast states
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')

  const linkToken = TOKENS.LINK
  const linkAddress = linkToken.addresses[chainId as keyof typeof linkToken.addresses]
  const poolAddress = AAVE_POOL_ADDRESSES[chainId as keyof typeof AAVE_POOL_ADDRESSES]

  // Get LINK balance
  const { data: balance } = useBalance({
    address,
    token: linkAddress,
  })

  // Check allowance for Aave Pool
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: linkAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && poolAddress ? [address, poolAddress] : undefined,
  })

  // Approve contract
  const { writeContract: approveToken } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setIsApproving(false)
        setToastMessage('✅ LINK approved successfully!')
        setToastType('success')
        setShowToast(true)
        refetchAllowance()
      },
      onError: (error) => {
        setIsApproving(false)
        setToastMessage(`❌ Approval failed: ${error.message}`)
        setToastType('error')
        setShowToast(true)
      },
    },
  })

  // Stake (supply) to Aave
  const { writeContract: stakeToken } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setIsStaking(false)
        setAmount('')
        setToastMessage('🎉 LINK staked successfully!')
        setToastType('success')
        setShowToast(true)
      },
      onError: (error) => {
        setIsStaking(false)
        setToastMessage(`❌ Staking failed: ${error.message}`)
        setToastType('error')
        setShowToast(true)
      },
    },
  })

  const amountBigInt = amount ? parseEther(amount) : BigInt(0)
  const hasEnoughAllowance = allowance && amountBigInt > BigInt(0) && allowance >= amountBigInt
  const hasEnoughBalance = balance && amountBigInt > BigInt(0) && balance.value >= amountBigInt

  const handleApprove = () => {
    if (!linkAddress || !poolAddress || !amountBigInt)
      return

    setIsApproving(true)
    approveToken({
      address: linkAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [poolAddress, amountBigInt],
    })
  }

  const handleStake = () => {
    if (!linkAddress || !poolAddress || !amountBigInt || !address)
      return

    setIsStaking(true)
    stakeToken({
      address: poolAddress,
      abi: AAVE_POOL_ABI,
      functionName: 'supply',
      args: [linkAddress, amountBigInt, address, 0],
    })
  }

  const handleMaxClick = () => {
    if (balance) {
      setAmount(formatEther(balance.value))
    }
  }

  return (
    <>
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <img
              src={linkToken.logo}
              alt="LINK"
              className="w-8 h-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Stake LINK</h3>
            <p className="text-gray-400 text-sm">Earn rewards by supplying LINK to Aave</p>
          </div>
        </div>

        {/* Balance Info */}
        <div className="mb-6 p-4 bg-gray-800/30 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Available Balance</span>
            <button
              onClick={handleMaxClick}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              disabled={!balance}
            >
              MAX
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              {balance ? formatEther(balance.value) : '0.00'}
            </span>
            <span className="text-gray-400">LINK</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount to Stake
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.0"
              min="0"
              step="0.01"
              className="w-full bg-gray-800/30 border border-gray-700/50 rounded-xl px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
              disabled={!isConnected}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-400 text-sm font-medium">LINK</span>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {amount && !hasEnoughBalance && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-700/50 rounded-xl">
            <p className="text-red-300 text-sm">Insufficient LINK balance</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {!isConnected
            ? (
                <div className="text-center">
                  <ConnectButton />
                </div>
              )
            : !hasEnoughAllowance && amount
                ? (
                    <button
                      onClick={handleApprove}
                      disabled={isApproving || !amount || !hasEnoughBalance}
                      className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                    >
                      {isApproving
                        ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Approving LINK...
                            </div>
                          )
                        : (
                            'Approve LINK'
                          )}
                    </button>
                  )
                : (
                    <button
                      onClick={handleStake}
                      disabled={isStaking || !amount || !hasEnoughBalance || !hasEnoughAllowance}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                    >
                      {isStaking
                        ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Staking LINK...
                            </div>
                          )
                        : (
                            'Stake LINK'
                          )}
                    </button>
                  )}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-300 text-sm font-medium mb-1">How it works</p>
              <p className="text-blue-200 text-xs leading-relaxed">
                By staking your LINK tokens to Aave, you'll earn interest rewards. Your tokens will be supplied to the Aave lending pool and you'll receive aLINK tokens representing your stake.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Stake() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Stake Your Assets
        </h1>
        <p className="text-gray-400">
          Earn rewards by staking your LINK tokens through Aave protocol
        </p>
      </div>

      <StakeCard />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-gray-300 font-medium">APY</span>
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-green-400">~3.2%</span>
          </div>
          <p className="text-gray-500 text-sm">Annual Percentage Yield</p>
        </div>

        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className="text-gray-300 font-medium">Total Staked</span>
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-blue-400">0.00</span>
            <span className="text-gray-400 text-lg ml-2">LINK</span>
          </div>
          <p className="text-gray-500 text-sm">Your staked balance</p>
        </div>
      </div>
    </div>
  )
}
