import { useContext } from 'react'
import { SocketichClientContext } from '../providers'

export function useClient () {
  return useContext(SocketichClientContext)
}
