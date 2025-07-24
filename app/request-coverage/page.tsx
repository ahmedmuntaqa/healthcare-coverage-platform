"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import DashboardLayout from "../components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function RequestCoverage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    location: "",
    specialty: "",
    additionalNotes: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  const specialties = [
    "Family Medicine",
    "Internal Medicine",
    "Emergency Medicine",
    "Pediatrics",
    "Surgery",
    "Cardiology",
    "Dermatology",
    "Psychiatry",
    "Radiology",
    "Anesthesiology",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Validation
    if (!formData.startDate || !formData.endDate || !formData.location || !formData.specialty) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success!",
      description: "Your coverage request has been posted successfully.",
    })

    // Reset form
    setFormData({
      startDate: "",
      endDate: "",
      location: "",
      specialty: "",
      additionalNotes: "",
    })

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Request Vacation Coverage</CardTitle>
            <CardDescription>Post a request for coverage during your vacation or time off</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (City, Province) *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Toronto, ON"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Medical Specialty *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, specialty: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Any additional information about the coverage needed..."
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Request Summary</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Requester:</strong> {user.fullName} ({user.role})
                  </p>
                  {user.cpsoNumber && (
                    <p>
                      <strong>CPSO:</strong> {user.cpsoNumber}
                    </p>
                  )}
                  <p>
                    <strong>Dates:</strong> {formData.startDate} to {formData.endDate}
                  </p>
                  <p>
                    <strong>Location:</strong> {formData.location}
                  </p>
                  <p>
                    <strong>Specialty:</strong> {formData.specialty}
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? "Posting Request..." : "Post Coverage Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
