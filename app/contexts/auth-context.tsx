"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from "firebase/auth"
import { app } from "@/lib/firebase"

export interface User {
  id: string
  email: string
  fullName: string
  role: "Physician" | "Surgeon" | "Physician Assistant" | "Nurse"
  cpsoNumber?: string
  specialty?: string
  location?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (userData: SignupData) => Promise<void>
  logout: () => void
  loading: boolean
  updateProfile: (data: Partial<User>) => Promise<void>
}

interface SignupData {
  fullName: string
  email: string
  password: string
  role: User["role"]
  cpsoNumber?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Try to get extra profile info from localStorage
        const savedUser = localStorage.getItem("userProfile:" + firebaseUser.uid)
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        } else {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            fullName: firebaseUser.displayName || "",
            role: "Physician", // default/fallback
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    const auth = getAuth(app)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = result.user
      // Try to get extra profile info from localStorage
      const savedUser = localStorage.getItem("userProfile:" + firebaseUser.uid)
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      } else {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          fullName: firebaseUser.displayName || "",
          role: "Physician", // fallback
        })
      }
    } catch (err) {
      setUser(null)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData: SignupData) => {
    setLoading(true)
    const auth = getAuth(app)
    try {
      const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      const firebaseUser = result.user
      // Save extra profile info in localStorage (simulate Firestore)
      const profile: User = {
        id: firebaseUser.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        cpsoNumber: userData.cpsoNumber,
      }
      localStorage.setItem("userProfile:" + firebaseUser.uid, JSON.stringify(profile))
      setUser(profile)
    } catch (err) {
      setUser(null)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const auth = getAuth(app)
    await signOut(auth)
    setUser(null)
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...data }
    setUser(updatedUser)
    // Update localStorage profile
    localStorage.setItem("userProfile:" + user.id, JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading,
        updateProfile,
      }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
