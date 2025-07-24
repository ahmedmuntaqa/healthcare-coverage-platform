"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import DashboardLayout from "../components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Edit, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    specialty: "",
    location: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        specialty: user.specialty || "",
        location: user.location || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setEditing(false)
      toast({
        title: "Profile Updated!",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        specialty: user.specialty || "",
        location: user.location || "",
      })
    }
    setEditing(false)
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

  // Mock user's active requests
  const activeRequests = [
    {
      id: "1",
      startDate: "2024-12-20",
      endDate: "2024-12-27",
      location: "Toronto, ON",
      specialty: "Family Medicine",
      status: "active",
      responses: 3,
    },
    {
      id: "2",
      startDate: "2024-12-30",
      endDate: "2025-01-05",
      location: "Hamilton, ON",
      specialty: "Emergency Medicine",
      status: "pending",
      responses: 1,
    },
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
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information and view your activity</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your personal and professional information</CardDescription>
                  </div>
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    {editing ? (
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{user.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {editing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{user.role}</Badge>
                      <span className="text-sm text-gray-500">(Read-only)</span>
                    </div>
                  </div>

                  {(user.role === "Physician" || user.role === "Surgeon") && user.cpsoNumber && (
                    <div className="space-y-2">
                      <Label>CPSO Number</Label>
                      <p className="text-gray-900 font-medium">{user.cpsoNumber}</p>
                      <span className="text-sm text-gray-500">(Read-only)</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="specialty">Medical Specialty</Label>
                    {editing ? (
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
                    ) : (
                      <p className="text-gray-900 font-medium">{user.specialty || "Not specified"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {editing ? (
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Province"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{user.location || "Not specified"}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>My Coverage Requests</CardTitle>
                <CardDescription>View and manage your active coverage requests</CardDescription>
              </CardHeader>
              <CardContent>
                {activeRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No active requests found.</p>
                    <Button className="mt-4" asChild>
                      <a href="/request-coverage">Create New Request</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{request.specialty} Coverage</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(request.startDate).toLocaleDateString()} -{" "}
                                  {new Date(request.endDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {request.location}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={request.status === "active" ? "default" : "secondary"}>
                                {request.status}
                              </Badge>
                              <p className="text-sm text-gray-500 mt-1">
                                {request.responses} response{request.responses !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              Edit Request
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
