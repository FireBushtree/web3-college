import { useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { apiClient } from '@/utils/api'

export function useAuth() {
  const { address, connector } = useAccount()
  const { signMessage } = useSignMessage({
  })

  useEffect(() => {
    if (!connector?.getChainId) {
      return
    }

    handleSignMessage()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector?.getChainId])

  function verifyMessage() {
    return apiClient.post('/auth/generate-message', {})
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
    if (res) {
      signMessage({ message: res.data.data.message }, {
        onSuccess(res) {
          console.log(res)
        },
        onError(res) {
          console.log(res)
        },
      })
    }
  }

  return {
    handleSignMessage,
  }
}
