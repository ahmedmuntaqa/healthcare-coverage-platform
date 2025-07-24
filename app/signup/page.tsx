"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Stethoscope } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as "Physician" | "Surgeon" | "Physician Assistant" | "Nurse" | "",
    cpsoNumber: "",
  })
  const [error, setError] = useState("")
  const { signup, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if ((formData.role === "Physician" || formData.role === "Surgeon") && !formData.cpsoNumber) {
      setError("CPSO Number is required for Physicians and Surgeons")
      return
    }

    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        cpsoNumber: formData.cpsoNumber || undefined,
      })
      router.push("/dashboard")
    } catch (err) {
      setError("Failed to create account. Please try again.")
    }
  }

  const showCPSOField = formData.role === "Physician" || formData.role === "Surgeon"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription>Join the Ontario Healthcare Coverage Platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physician">Physician</SelectItem>
                  <SelectItem value="Surgeon">Surgeon</SelectItem>
                  <SelectItem value="Physician Assistant">Physician Assistant</SelectItem>
                  <SelectItem value="Nurse">Nurse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showCPSOField && (
              <div className="space-y-2">
                <Label htmlFor="cpsoNumber">CPSO Number *</Label>
                <Input
                  id="cpsoNumber"
                  value={formData.cpsoNumber}
                  onChange={(e) => setFormData({ ...formData, cpsoNumber: e.target.value })}
                  placeholder="Enter your CPSO number"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
