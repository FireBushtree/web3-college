import { useParams } from 'react-router'

export default function Claim() {
  const { id } = useParams()

  return (
    <div>
      <h1>Claim Page</h1>
      <p>
        ID:
        {id}
      </p>
    </div>
  )
}
