"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from "lucide-react"

interface AdminLoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (username: string, password: string) => void
  error?: string
}

export function AdminLoginModal({ open, onOpenChange, onLogin, error }: AdminLoginModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (attempts >= 3) {
      setLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    onLogin(username, password)

    if (error) {
      setAttempts((prev) => prev + 1)
    }

    setLoading(false)

    if (!error) {
      setUsername("")
      setPassword("")
      setAttempts(0)
    }
  }

  const handleClose = () => {
    setUsername("")
    setPassword("")
    setAttempts(0)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-2 border-red-200 bg-gradient-to-br from-slate-50 to-red-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <Shield className="h-6 w-6 text-red-600" />
            <Lock className="h-5 w-5 text-red-600" />
            Administrative Access
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">Restricted access for authorized personnel only</p>
        </DialogHeader>

        {attempts >= 3 && (
          <Alert className="border-red-300 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Maximum login attempts exceeded. Access temporarily restricted.
            </AlertDescription>
          </Alert>
        )}

        {error && attempts < 3 && (
          <Alert className="border-red-300 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error} ({3 - attempts} attempts remaining)
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-username" className="text-slate-700 font-semibold">
              Administrator Username
            </Label>
            <Input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter administrative username"
              className="border-slate-300 focus:border-red-500 focus:ring-red-500"
              disabled={attempts >= 3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-slate-700 font-semibold">
              Administrator Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrative password"
                className="border-slate-300 focus:border-red-500 focus:ring-red-500 pr-10"
                disabled={attempts >= 3}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={attempts >= 3}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-500" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-500" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading || attempts >= 3}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Access System
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-slate-500 text-center bg-slate-100 p-3 rounded border">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Lock className="h-3 w-3" />
            <span className="font-semibold">SECURE ADMINISTRATIVE ACCESS</span>
          </div>
          <p>All access attempts are logged and monitored for security purposes.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
