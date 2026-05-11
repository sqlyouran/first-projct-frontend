import { useEffect, useState } from 'react'

interface HealthStatus {
  status: string
  service: string
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="app">
      <h1>first-projct</h1>
      <p>Full-stack project with OpenSpec + Superpowers + Harness</p>
      <div className="status">
        <h2>Backend Status</h2>
        {error && <p className="error">Connection failed: {error}</p>}
        {health && (
          <p className="success">
            {health.service}: {health.status}
          </p>
        )}
        {!health && !error && <p>Connecting...</p>}
      </div>
    </div>
  )
}

export default App
