import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { WagmiProvider } from 'wagmi'
import Create from '@/pages/Create'
import Detail from '@/pages/Detail'
import Home from '@/pages/Home'
import { wagmiConfig } from './config/wagmi'
import './index.css'

const container = document.querySelector('#app')!
const queryClient = new QueryClient()

createRoot(container).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<Home />} />
            <Route index element={<Create />} />
            <Route path="/course/:id" element={<Detail />} />
          </Routes>
        </BrowserRouter>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
)
