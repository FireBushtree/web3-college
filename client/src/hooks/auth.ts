import { useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { apiClient } from '@/utils/api'

export function useAuth() {
  const { address, connector } = useAccount()
  const { signMessage } = useSignMessage({
  })

  useEffect(() => {
    if (!connector?.getChainId || !address) {
      return
    }

    const expiry = localStorage.getItem('auth-expiry')
    if (!expiry || Date.now() > Number.parseInt(expiry) * 1000) {
      handleSignMessage()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector?.getChainId, address])

  function verifyMessage(params: {
    address: string
    message: string
    signature: string
    timestamp: number
    expiry: number
  }) {
    return apiClient.post('/auth/verify-token', {}, {
      headers: {
        'x-auth-address': params.address,
        'x-auth-message': encodeURIComponent(params.message),
        'x-auth-signature': params.signature,
        'x-auth-timestamp': params.timestamp.toString(),
        'x-auth-expiry': params.expiry.toString(),
      },
    })
  }

  function generateMessage() {
    if (!address) {
      return
    }

    return apiClient.post('/auth/generate-message', {
      address,
    })
  }

  async function handleSignMessage() {
    const res = await generateMessage()
    if (res && address) {
      const { message, timestamp, expiry } = res.data.data
      signMessage({ message }, {
        async onSuccess(signature) {
          try {
            await verifyMessage({
              address,
              message,
              signature,
              timestamp,
              expiry,
            })
            localStorage.setItem('auth-expiry', expiry.toString())
          }
          catch (error) {
            console.error('Verification failed:', error)
          }
        },
        onError(error) {
          console.error('Signing failed:', error)
        },
      })
    }
  }

  return {
    handleSignMessage,
    verifyMessage,
  }
}
