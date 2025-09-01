import { useState } from 'react'
import { formatUnits } from 'viem'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { OWC_TOKEN_ADDRESSES, OWC_TOKEN_DECIMALS } from '@/config/tokens'

interface Token {
  symbol: string
  name: string
  address: string | null
  decimals: number
}

const ETH: Token = {
  symbol: 'ETH',
  name: 'Ethereum',
  address: null,
  decimals: 18,
}

const OWC: Token = {
  symbol: 'OWC',
  name: 'OWC Token',
  address: OWC_TOKEN_ADDRESSES[1337],
  decimals: OWC_TOKEN_DECIMALS,
}

interface TokenInputProps {
  token: Token
  amount: string
  onAmountChange: (value: string) => void
  balance?: string
  label: string
}

function TokenInput({ token, amount, onAmountChange, balance, label }: TokenInputProps) {
  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        {balance && (
          <span className="text-sm text-gray-400">
            Balance:
            {' '}
            {balance}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700/70 transition-colors rounded-xl px-3 py-2 border border-gray-600/50"
        >
          <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {token.symbol.slice(0, 1)}
            </span>
          </div>
          <span className="text-white font-medium">{token.symbol}</span>
        </button>

        <input
          type="text"
          value={amount}
          onChange={e => onAmountChange(e.target.value)}
          placeholder="0.0"
          className="flex-1 bg-transparent text-right text-2xl font-medium text-white placeholder-gray-500 outline-none"
        />
      </div>
    </div>
  )
}

export default function SwapCard() {
  const [fromToken, setFromToken] = useState<Token>(ETH)
  const [toToken, setToToken] = useState<Token>(OWC)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const { data: ethBalance } = useBalance({ address })
  const { data: owcBalance } = useBalance({
    address,
    token: OWC_TOKEN_ADDRESSES[chainId as keyof typeof OWC_TOKEN_ADDRESSES],
  })

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const getTokenBalance = (token: Token) => {
    if (token.address === null) {
      return ethBalance ? Number.parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4) : '0.0000'
    }
    return owcBalance ? Number.parseFloat(formatUnits(owcBalance.value, OWC_TOKEN_DECIMALS)).toFixed(4) : '0.0000'
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    // Simple 1:1 mock rate for demo
    setToAmount(value)
  }

  const handleSwap = () => {
    if (!isConnected) {
      // TODO: Show connect wallet modal

    }
    // TODO: Implement actual swap logic
    // Swapping logic will be implemented here
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Swap</h2>
        </div>

        <div className="space-y-1">
          <TokenInput
            token={fromToken}
            amount={fromAmount}
            onAmountChange={handleFromAmountChange}
            balance={getTokenBalance(fromToken)}
            label="From"
          />

          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleSwapTokens}
              className="bg-gray-800 hover:bg-gray-700 border-4 border-gray-900/50 rounded-xl p-2 transition-all duration-200 hover:rotate-180"
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <TokenInput
            token={toToken}
            amount={toAmount}
            onAmountChange={setToAmount}
            balance={getTokenBalance(toToken)}
            label="To"
          />
        </div>

        <div className="mt-6">
          {!isConnected
            ? (
                <div className="text-center py-4">
                  <span className="text-gray-400">Connect wallet to trade</span>
                </div>
              )
            : (
                <button
                  type="button"
                  onClick={handleSwap}
                  disabled={!fromAmount || Number.parseFloat(fromAmount) <= 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {!fromAmount || Number.parseFloat(fromAmount) <= 0 ? 'Enter an amount' : 'Swap'}
                </button>
              )}
        </div>
      </div>
    </div>
  )
}
