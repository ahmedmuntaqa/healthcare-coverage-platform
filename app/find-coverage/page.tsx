"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import DashboardLayout from "../components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CoverageRequest {
  id: string
  requesterName: string
  role: string
  specialty: string
  startDate: string
  endDate: string
  location: string
  additionalNotes: string
  postedDate: string
}

export default function FindCoverage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [requests, setRequests] = useState<CoverageRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<CoverageRequest[]>([])
  const [filters, setFilters] = useState({
    location: "",
    specialty: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Mock data - in real app, this would come from Firebase/API
    const mockRequests: CoverageRequest[] = [
      {
        id: "1",
        requesterName: "Dr. Sarah Johnson",
        role: "Physician",
        specialty: "Family Medicine",
        startDate: "2024-12-20",
        endDate: "2024-12-27",
        location: "Toronto, ON",
        additionalNotes: "Looking for coverage at family clinic. EMR experience preferred.",
        postedDate: "2024-12-15",
      },
      {
        id: "2",
        requesterName: "Dr. Michael Chen",
        role: "Surgeon",
        specialty: "Surgery",
        startDate: "2024-12-25",
        endDate: "2025-01-02",
        location: "Ottawa, ON",
        additionalNotes: "Emergency surgery coverage needed. Hospital privileges required.",
        postedDate: "2024-12-14",
      },
      {
        id: "3",
        requesterName: "Dr. Emily Rodriguez",
        role: "Physician",
        specialty: "Emergency Medicine",
        startDate: "2024-12-30",
        endDate: "2025-01-05",
        location: "Hamilton, ON",
        additionalNotes: "ER shifts, 12-hour rotations. ACLS certification required.",
        postedDate: "2024-12-13",
      },
    ]
    setRequests(mockRequests)
    setFilteredRequests(mockRequests)
  }, [])

  useEffect(() => {
    // Filter requests based on current filters
    let filtered = requests

    if (filters.location) {
      filtered = filtered.filter((req) => req.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    if (filters.specialty) {
      filtered = filtered.filter((req) => req.specialty === filters.specialty)
    }

    if (filters.startDate) {
      filtered = filtered.filter((req) => req.startDate >= filters.startDate)
    }

    if (filters.endDate) {
      filtered = filtered.filter((req) => req.endDate <= filters.endDate)
    }

    setFilteredRequests(filtered)
  }, [filters, requests])

  const handleExpressInterest = (requestId: string) => {
    toast({
      title: "Interest Expressed!",
      description: "Your interest has been sent to the requester. They will contact you soon.",
    })
  }

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Coverage Opportunities</h1>
          <p className="text-gray-600">Browse available coverage requests from healthcare providers</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="City, Province"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select onValueChange={(value) => setFilters({ ...filters, specialty: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">From Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">To Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{filteredRequests.length} Coverage Opportunities</h2>
          </div>

          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No coverage requests match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.requesterName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {request.role}
                          </div>
                          <Badge variant="secondary">{request.specialty}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Posted {new Date(request.postedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(request.startDate).toLocaleDateString()} -{" "}
                        {new Date(request.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {request.location}
                      </div>
                    </div>

                    {request.additionalNotes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{request.additionalNotes}</p>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleExpressInterest(request.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Express Interest
                      </Button>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
