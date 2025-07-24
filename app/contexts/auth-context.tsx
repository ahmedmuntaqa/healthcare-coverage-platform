"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from "firebase/auth"
import { app, db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to get extra profile info from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          setUser(userDoc.data() as User)
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
      // Try to get extra profile info from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (userDoc.exists()) {
        setUser(userDoc.data() as User)
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
      // Save extra profile info in Firestore
      const profile: User = {
        id: firebaseUser.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        cpsoNumber: userData.cpsoNumber,
      }
      await setDoc(doc(db, "users", firebaseUser.uid), profile)
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
    // Update Firestore profile
    await setDoc(doc(db, "users", user.id), updatedUser)
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
      {loading ? (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #3b82f6", borderTop: "4px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : children}
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
