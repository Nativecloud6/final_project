"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      router.push("/dashboard")
    } else {
      alert("Login failed")
    }
  }

  const handleRegister = async () => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      alert("Registered successfully. Logging in...")
      await handleLogin()
    } else {
      const data = await res.json()
      alert(`Register failed: ${data.message}`)
    }
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Data Center Management</h2>

      <input
        type="text"
        placeholder="Username"
        className="w-full mb-3 p-2 border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-3 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex justify-between">
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
        <button onClick={handleRegister} className="bg-gray-500 text-white px-4 py-2 rounded">
          Register
        </button>
      </div>
    </div>
  )
}
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <LoginForm />
    </main>
  )
}

