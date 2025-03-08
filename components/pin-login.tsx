"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface PinLoginProps {
  onAuthenticate: () => void
}

export default function PinLogin({ onAuthenticate }: PinLoginProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const correctPin = "1337"
  const maxAttempts = 5

  // Load previous attempts from localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem("g-te-goyna-attempts")
    if (storedAttempts) {
      setAttempts(Number.parseInt(storedAttempts, 10))
    }

    // Check if locked out
    const lockoutTime = localStorage.getItem("g-te-goyna-lockout")
    if (lockoutTime) {
      const lockoutExpiry = Number.parseInt(lockoutTime, 10)
      if (Date.now() < lockoutExpiry) {
        setAttempts(maxAttempts)
      } else {
        // Lockout expired
        localStorage.removeItem("g-te-goyna-lockout")
        localStorage.setItem("g-te-goyna-attempts", "0")
        setAttempts(0)
      }
    }
  }, [maxAttempts])

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value)
    if (error) setError(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (attempts >= maxAttempts) {
      return
    }

    setIsLoading(true)

    // Simulate a slight delay for security
    setTimeout(() => {
      if (pin === correctPin) {
        // Reset attempts on successful login
        localStorage.setItem("g-te-goyna-attempts", "0")
        setIsLoading(false)
        toast({
          title: "Authentication successful",
          description: "Welcome to G Te Goyna Invoice Generator",
        })
        onAuthenticate()
      } else {
        const newAttempts = attempts + 1
        setError(true)
        setAttempts(newAttempts)
        localStorage.setItem("g-te-goyna-attempts", newAttempts.toString())

        // Set lockout if max attempts reached
        if (newAttempts >= maxAttempts) {
          const lockoutExpiry = Date.now() + 30 * 60 * 1000 // 30 minutes
          localStorage.setItem("g-te-goyna-lockout", lockoutExpiry.toString())
          toast({
            variant: "destructive",
            title: "Account locked",
            description: "Too many failed attempts. Please try again later.",
          })
        }

        setIsLoading(false)
        // Clear the input after a short delay
        setTimeout(() => setPin(""), 300)
      }
    }, 800)
  }

  const togglePinVisibility = () => {
    setShowPin(!showPin)
  }

  const remainingAttempts = maxAttempts - attempts

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center">Invoice Generator</h2>
          <p className="text-muted-foreground text-center mt-1">Enter PIN to access</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Incorrect PIN. {remainingAttempts} {remainingAttempts === 1 ? "attempt" : "attempts"} remaining.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN Code</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={handlePinChange}
                  className={`text-center text-lg pr-10 ${error ? "border-destructive" : ""}`}
                  maxLength={10}
                  autoFocus
                  disabled={attempts >= maxAttempts || isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={togglePinVisibility}
                  disabled={attempts >= maxAttempts}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPin ? "Hide PIN" : "Show PIN"}</span>
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!pin || attempts >= maxAttempts || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock Access"
              )}
            </Button>
          </div>
        </form>

        {attempts >= maxAttempts && (
          <Alert className="mt-4 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Too many failed attempts. Account is locked for 30 minutes.</AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-center text-muted-foreground mt-6">
          G Te Goyna &copy; {new Date().getFullYear()} | All Rights Reserved
        </p>
      </Card>
    </div>
  )
}

