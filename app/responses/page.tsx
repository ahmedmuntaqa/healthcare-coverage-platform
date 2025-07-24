"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import DashboardLayout from "../components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Response {
  id: string
  type: "sent" | "received"
  requestId: string
  requesterName: string
  responderName: string
  specialty: string
  startDate: string
  endDate: string
  location: string
  message: string
  status: "pending" | "accepted" | "declined"
  timestamp: string
  replies: Reply[]
}

interface Reply {
  id: string
  sender: string
  message: string
  timestamp: string
}

export default function ResponsesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [responses, setResponses] = useState<Response[]>([])
  const [replyMessages, setReplyMessages] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Mock data - in real app, this would come from Firebase/API
    const mockResponses: Response[] = [
      {
        id: "1",
        type: "sent",
        requestId: "req1",
        requesterName: "Dr. Sarah Johnson",
        responderName: user?.fullName || "",
        specialty: "Family Medicine",
        startDate: "2024-12-20",
        endDate: "2024-12-27",
        location: "Toronto, ON",
        message:
          "I am interested in covering your practice during this period. I have 5 years of family medicine experience.",
        status: "pending",
        timestamp: "2024-12-16T10:30:00Z",
        replies: [
          {
            id: "r1",
            sender: "Dr. Sarah Johnson",
            message: "Thank you for your interest! Could you tell me about your EMR experience?",
            timestamp: "2024-12-16T14:20:00Z",
          },
        ],
      },
      {
        id: "2",
        type: "received",
        requestId: "req2",
        requesterName: user?.fullName || "",
        responderName: "Dr. Michael Chen",
        specialty: "Emergency Medicine",
        startDate: "2024-12-30",
        endDate: "2025-01-05",
        location: "Hamilton, ON",
        message: "I can cover your ER shifts. I have ACLS certification and 3 years of emergency medicine experience.",
        status: "pending",
        timestamp: "2024-12-15T16:45:00Z",
        replies: [],
      },
    ]
    setResponses(mockResponses)
  }, [user])

  const handleReply = (responseId: string) => {
    const message = replyMessages[responseId]
    if (!message.trim()) return

    // Mock sending reply
    setResponses((prev) =>
      prev.map((response) => {
        if (response.id === responseId) {
          return {
            ...response,
            replies: [
              ...response.replies,
              {
                id: Date.now().toString(),
                sender: user?.fullName || "",
                message: message,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        }
        return response
      }),
    )

    setReplyMessages((prev) => ({ ...prev, [responseId]: "" }))

    toast({
      title: "Reply Sent!",
      description: "Your reply has been sent successfully.",
    })
  }

  const handleStatusChange = (responseId: string, status: "accepted" | "declined") => {
    setResponses((prev) => prev.map((response) => (response.id === responseId ? { ...response, status } : response)))

    toast({
      title: status === "accepted" ? "Response Accepted!" : "Response Declined",
      description: `You have ${status} this coverage response.`,
    })
  }

  const sentResponses = responses.filter((r) => r.type === "sent")
  const receivedResponses = responses.filter((r) => r.type === "received")

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
          <h1 className="text-2xl font-bold text-gray-900">My Responses</h1>
          <p className="text-gray-600">Manage your coverage responses and conversations</p>
        </div>

        <Tabs defaultValue="received" className="space-y-4">
          <TabsList>
            <TabsTrigger value="received">Received Responses ({receivedResponses.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent Responses ({sentResponses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedResponses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No responses received yet.</p>
                </CardContent>
              </Card>
            ) : (
              receivedResponses.map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Response from {response.responderName}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(response.startDate).toLocaleDateString()} -{" "}
                            {new Date(response.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {response.location}
                          </div>
                          <Badge variant="secondary">{response.specialty}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            response.status === "accepted"
                              ? "default"
                              : response.status === "declined"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {response.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(response.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">{response.message}</p>
                    </div>

                    {/* Conversation Thread */}
                    {response.replies.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Conversation</h4>
                        {response.replies.map((reply) => (
                          <div key={reply.id} className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm text-blue-900">{reply.sender}</span>
                              <span className="text-xs text-blue-600">
                                {new Date(reply.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-blue-800">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Section */}
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessages[response.id] || ""}
                        onChange={(e) =>
                          setReplyMessages((prev) => ({
                            ...prev,
                            [response.id]: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                      <div className="flex justify-between">
                        <div className="space-x-2">
                          {response.status === "pending" && (
                            <>
                              <Button
                                onClick={() => handleStatusChange(response.id, "accepted")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button variant="destructive" onClick={() => handleStatusChange(response.id, "declined")}>
                                Decline
                              </Button>
                            </>
                          )}
                        </div>
                        <Button onClick={() => handleReply(response.id)} disabled={!replyMessages[response.id]?.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentResponses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No responses sent yet.</p>
                </CardContent>
              </Card>
            ) : (
              sentResponses.map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Response to {response.requesterName}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(response.startDate).toLocaleDateString()} -{" "}
                            {new Date(response.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {response.location}
                          </div>
                          <Badge variant="secondary">{response.specialty}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            response.status === "accepted"
                              ? "default"
                              : response.status === "declined"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {response.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(response.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">{response.message}</p>
                    </div>

                    {/* Conversation Thread */}
                    {response.replies.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Conversation</h4>
                        {response.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`p-3 rounded-lg ${reply.sender === user.fullName ? "bg-blue-50" : "bg-gray-50"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{reply.sender}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Section */}
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessages[response.id] || ""}
                        onChange={(e) =>
                          setReplyMessages((prev) => ({
                            ...prev,
                            [response.id]: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button onClick={() => handleReply(response.id)} disabled={!replyMessages[response.id]?.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
