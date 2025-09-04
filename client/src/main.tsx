import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { WagmiProvider } from 'wagmi'
import Layout from '@/components/Layout'
import Create from '@/pages/Create'
import Detail from '@/pages/Detail'
import Edit from '@/pages/Edit'
import Home from '@/pages/Home'
import Profile from '@/pages/Profile'
import Auth from './components/Auth'
import { wagmiConfig } from './config/wagmi'
import './index.css'

const container = document.querySelector('#app')!
const queryClient = new QueryClient()

createRoot(container).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <Auth />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route index element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/course/:id" element={<Detail />} />
              <Route path="/edit/:id" element={<Edit />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
)
