"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DCMLogo } from "@/components/dcm-logo"

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would validate credentials here
    router.push("/dashboard")
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="flex items-center justify-center pb-6 pt-8">
        <div className="flex flex-col items-center gap-2">
          <DCMLogo size="lg" showText={false} />
          <h2 className="text-2xl font-bold mt-2">Data Center Management</h2>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember" className="text-sm font-normal">
              Remember me
            </Label>
          </div>
          <Button type="submit" className="w-full bg-[#2A73CC] hover:bg-[#2A73CC]/90">
            Login
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pb-8">
        <Link href="#" className="text-sm text-[#2A73CC] hover:underline">
          Forgot password?
        </Link>
      </CardFooter>
    </Card>
  )
}
