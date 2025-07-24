"use client"

import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import DashboardLayout from "../components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Search, User, Plus } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

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
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
          <p className="text-blue-100">
            {user.role} • {user.specialty || "Healthcare Professional"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/request-coverage">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Request Coverage</CardTitle>
                <Plus className="h-4 w-4 ml-auto text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">New</div>
                <p className="text-xs text-muted-foreground">Post a new coverage request</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/find-coverage">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Find Coverage</CardTitle>
                <Search className="h-4 w-4 ml-auto text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Browse</div>
                <p className="text-xs text-muted-foreground">Find available opportunities</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/responses">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Responses</CardTitle>
                <Calendar className="h-4 w-4 ml-auto text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">3</div>
                <p className="text-xs text-muted-foreground">Active conversations</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest coverage requests and responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Coverage Request Posted</p>
                  <p className="text-sm text-gray-600">Family Medicine • Dec 20-27, 2024</p>
                </div>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New Response Received</p>
                  <p className="text-sm text-gray-600">Dr. Smith interested in your request</p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
