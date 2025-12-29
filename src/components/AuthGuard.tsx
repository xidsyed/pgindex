import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pincode, setPincode] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token === "1234") {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = () => {
    if (pincode === "1234") {
      localStorage.setItem("access_token", "1234")
      setIsAuthenticated(true)
    } else {
      // In a real app we'd use a toast here, but alert is fine for now/bootstrap
      alert("Incorrect Pincode")
    }
  }

  if (loading) return null // Or a spinner

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">PG Index Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <Button className="w-full" onClick={handleLogin}>
            Enter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
