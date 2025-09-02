import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Link, useLocation } from 'react-router'
import { formatUnits } from 'viem'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { OWC_TOKEN_ADDRESSES, OWC_TOKEN_DECIMALS } from '@/config/tokens'

interface WalletInfoProps {
  address: string
  owcBalance: string
}

function WalletInfo({ address, owcBalance }: WalletInfoProps) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-1 backdrop-blur-sm">
      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-sm font-semibold">
          {address.slice(2, 4).toUpperCase()}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-100">{shortAddress}</span>
        <span className="text-xs text-gray-400">
          {owcBalance}
          {' '}
          OWC
        </span>
      </div>
    </div>
  )
}

// 导航菜单组件
function Navigation() {
  const location = useLocation()

  const navItems = [
    { name: 'Home', path: '/', current: location.pathname === '/' },
    { name: 'Course', path: '/create', current: location.pathname === '/create' },
  ]

  return (
    <nav className="flex items-center space-x-8">
      {navItems.map(item => (
        <Link
          key={item.name}
          to={item.path}
          className={`text-sm font-medium transition-colors duration-200 ${
            item.current
              ? 'text-pink-400'
              : 'text-gray-300 hover:text-pink-400'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}

export default function Header() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({
    address,
    token: OWC_TOKEN_ADDRESSES[chainId as keyof typeof OWC_TOKEN_ADDRESSES],
  })

  const owcBalance = balance
    ? Number.parseFloat(formatUnits(balance.value, OWC_TOKEN_DECIMALS)).toFixed(2)
    : '0.00'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-800/20 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                Web3 College
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Navigation />
            {isConnected && address
              ? (
                  <WalletInfo address={address} owcBalance={owcBalance} />
                )
              : (
                  <ConnectButton />
                )}
          </div>
        </div>
      </div>
    </header>
  )
}
