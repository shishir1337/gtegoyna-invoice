"use client"

import { useState, useEffect } from "react"
import InvoiceGenerator from "@/components/invoice-generator"
import PinLogin from "@/components/pin-login"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user was previously authenticated in this session
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem("g-te-goyna-auth")
      setIsAuthenticated(authStatus === "true")
      setIsLoading(false)
    }

    // Add a small delay to prevent flash of login screen
    const timer = setTimeout(checkAuth, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleAuthenticate = () => {
    setIsAuthenticated(true)
    // Store auth status in session storage
    sessionStorage.setItem("g-te-goyna-auth", "true")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading invoice generator...</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-4 px-4 md:py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
        <span className="block text-primary">G Te Goyna</span>
        <span className="block text-lg md:text-xl mt-1">গ তে গয়না</span>
      </h1>

      {isAuthenticated ? (
        <div className="fade-in">
          <InvoiceGenerator />
        </div>
      ) : (
        <div className="slide-up">
          <PinLogin onAuthenticate={handleAuthenticate} />
        </div>
      )}
    </main>
  )
}

