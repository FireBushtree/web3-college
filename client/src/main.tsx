import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { WagmiProvider } from 'wagmi'
import Layout from '@/components/Layout'
import { wagmiConfig } from './config/wagmi'
import './index.css'
import React from 'react'

const container = document.querySelector('#app')!
const queryClient = new QueryClient()

const Home = React.lazy(
  () => import(/* webpackChunkName: "Home" */ '@/pages/Home'),
)
const Stake = React.lazy(
  () => import(/* webpackChunkName: "Stake" */ '@/pages/Stake'),
)
const Profile = React.lazy(
  () => import(/* webpackChunkName: "Profile" */ '@/pages/Profile'),
)
const Create = React.lazy(
  () => import(/* webpackChunkName: "Create" */ '@/pages/Create'),
)
const Detail = React.lazy(
  () => import(/* webpackChunkName: "Detail" */ '@/pages/Detail'),
)
const Edit = React.lazy(
  () => import(/* webpackChunkName: "Edit" */ '@/pages/Edit'),
)
const Auth = React.lazy(
  () => import(/* webpackChunkName: "Auth" */ '@/components/Auth'),
)

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
              <Route path="/stake" element={<Stake />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
)
