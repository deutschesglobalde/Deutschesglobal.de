"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import TransferPinDialog from "@/components/transfer-pin-dialog"
import {
  CreditCard,
  Send,
  Download,
  Upload,
  Eye,
  EyeOff,
  Settings,
  LogOut,
  User,
  Bell,
  Shield,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface DashboardClientProps {
  user: any
  profile: any
  bankAccounts: any[]
  transactions: any[]
}

export default function DashboardClient({ user, profile, bankAccounts, transactions }: DashboardClientProps) {
  const [showBalance, setShowBalance] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [transferData, setTransferData] = useState({
    amount: "",
    recipient: "",
    description: "",
    type: "transfer",
  })
  const [isTransferLoading, setIsTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState("")
  const [transferSuccess, setTransferSuccess] = useState("")
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [pendingTransfer, setPendingTransfer] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const primaryAccount = bankAccounts[0] || { balance: 0, account_number: "N/A", currency: "EUR" }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleTransfer = async () => {
    if (!transferData.amount || !transferData.recipient) {
      setTransferError("Please fill in all required fields")
      return
    }

    const amount = Number.parseFloat(transferData.amount)
    if (amount <= 0) {
      setTransferError("Amount must be greater than 0")
      return
    }

    if ((transferData.type === "withdrawal" || transferData.type === "transfer") && amount > primaryAccount.balance) {
      setTransferError("Insufficient funds")
      return
    }

    setPendingTransfer(transferData)
    setShowPinDialog(true)
    setShowTransferDialog(false)
  }

  const handlePinVerifiedTransfer = async (pin: string) => {
    if (!pendingTransfer) return

    setIsTransferLoading(true)
    setTransferError("")
    setTransferSuccess("")

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(pendingTransfer.amount),
          recipient: pendingTransfer.recipient,
          description: pendingTransfer.description,
          transaction_type: pendingTransfer.type,
          pin: pin, // Include PIN for server-side verification
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Transaction failed")
      }

      setTransferSuccess("Transaction submitted successfully! It will be reviewed by our admin team.")
      setTransferData({ amount: "", recipient: "", description: "", type: "transfer" })
      setPendingTransfer(null)
      setShowPinDialog(false)

      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : "An error occurred")
      setShowPinDialog(false)
    } finally {
      setIsTransferLoading(false)
    }
  }

  const handleQuickTransfer = () => {
    setTransferData({ amount: "", recipient: "", description: "", type: "transfer" })
    setShowTransferDialog(true)
  }

  const formatCurrency = (amount: number, currency = "EUR") => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "transfer":
        return <Send className="h-4 w-4 text-blue-500" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-700 border-green-500/30",
      declined: "bg-red-500/20 text-red-700 border-red-500/30",
      completed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    }
    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <TrendingUp className="h-5 w-5" /> },
    { id: "transactions", label: "Transactions", icon: <CreditCard className="h-5 w-5" /> },
    { id: "transfer", label: "Transfer", icon: <Send className="h-5 w-5" /> },
    { id: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center gap-2">
                <img
                  src="/images/deutsche-bank-logo.png"
                  alt="Deutsche Bank"
                  className="h-8 w-auto"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(230deg) brightness(92%) contrast(112%)",
                  }}
                />
                <span className="text-xl font-serif font-bold text-slate-900">Deutsche Global Bank</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`${
              mobileMenuOpen ? "block" : "hidden"
            } lg:block fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 lg:border-0`}
          >
            <div className="p-6 pt-20 lg:pt-6">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold mb-2 text-slate-900">
                Welcome back, {profile?.first_name || "User"}!
              </h1>
              <p className="text-slate-600">Manage your banking needs with ease and security.</p>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Account Balance Card */}
                <Card className="bg-white border border-slate-200 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-serif text-slate-900">Primary Account</CardTitle>
                        <CardDescription className="text-slate-600">
                          Account: {primaryAccount.account_number}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      >
                        {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-serif font-bold text-slate-900 mb-4">
                      {showBalance ? formatCurrency(primaryAccount.balance) : "••••••"}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleQuickTransfer}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Transfer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Deposit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Withdraw
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white border border-slate-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Pending Transactions</p>
                          <p className="text-2xl font-serif font-bold text-slate-900">
                            {transactions.filter((t) => t.status === "pending").length}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-slate-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">This Month</p>
                          <p className="text-2xl font-serif font-bold text-slate-900">{transactions.length}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-slate-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Account Status</p>
                          <p className="text-2xl font-serif font-bold text-slate-900">Active</p>
                        </div>
                        <Shield className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions */}
                <Card className="bg-white border border-slate-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-serif text-slate-900">Recent Transactions</CardTitle>
                    <CardDescription className="text-slate-600">Your latest banking activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactions.length > 0 ? (
                      <div className="space-y-4">
                        {transactions.slice(0, 5).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              {getTransactionIcon(transaction.transaction_type)}
                              <div>
                                <p className="font-medium text-slate-900">
                                  {transaction.description || `${transaction.transaction_type} transaction`}
                                </p>
                                <p className="text-sm text-slate-600">{formatDate(transaction.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-slate-900">{formatCurrency(transaction.amount)}</p>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No transactions yet</p>
                        <p className="text-sm text-slate-500">Your transaction history will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <Card className="bg-white border border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-serif text-slate-900">All Transactions</CardTitle>
                  <CardDescription className="text-slate-600">Complete transaction history</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 rounded-md bg-slate-50 border border-slate-200"
                        >
                          <div className="flex items-center gap-4">
                            {getTransactionIcon(transaction.transaction_type)}
                            <div>
                              <p className="font-medium text-slate-900">
                                {transaction.description || `${transaction.transaction_type} transaction`}
                              </p>
                              <p className="text-sm text-slate-600">{formatDate(transaction.created_at)}</p>
                              <p className="text-xs text-slate-500">ID: {transaction.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-slate-900 text-lg">{formatCurrency(transaction.amount)}</p>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-lg text-slate-600 mb-2">No transactions found</p>
                      <p className="text-sm text-slate-500">Start by making your first transaction</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Transfer Tab */}
            {activeTab === "transfer" && (
              <Card className="bg-white border border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-serif text-slate-900">New Transfer</CardTitle>
                  <CardDescription className="text-slate-600">Send money or make a transaction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="transfer-type" className="text-slate-700">
                      Transaction Type
                    </Label>
                    <Select
                      value={transferData.type}
                      onValueChange={(value) => setTransferData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="transfer">Transfer Money</SelectItem>
                        <SelectItem value="deposit">Deposit Funds</SelectItem>
                        <SelectItem value="withdrawal">Withdraw Funds</SelectItem>
                        <SelectItem value="payment">Make Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount" className="text-slate-700">
                        Amount (EUR)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={transferData.amount}
                        onChange={(e) => setTransferData((prev) => ({ ...prev, amount: e.target.value }))}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipient" className="text-slate-700">
                        Recipient
                      </Label>
                      <Input
                        id="recipient"
                        placeholder="Account number or email"
                        value={transferData.recipient}
                        onChange={(e) => setTransferData((prev) => ({ ...prev, recipient: e.target.value }))}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-slate-700">
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="Payment description or reference"
                      value={transferData.description}
                      onChange={(e) => setTransferData((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>

                  {transferError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{transferError}</AlertDescription>
                    </Alert>
                  )}

                  {transferSuccess && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">{transferSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-slate-900 font-medium mb-2">Transaction Summary</p>
                    <div className="space-y-1 text-sm text-slate-700">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span>
                          {transferData.amount ? formatCurrency(Number.parseFloat(transferData.amount)) : "€0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{transferData.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span>Pending Admin Approval</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleTransfer}
                    disabled={isTransferLoading || !transferData.amount || !transferData.recipient}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isTransferLoading ? "Processing..." : "Submit Transaction"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="bg-white border border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-serif text-slate-900">Profile Information</CardTitle>
                  <CardDescription className="text-slate-600">Your personal and account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-700">First Name</Label>
                      <p className="text-slate-900 font-medium">{profile?.first_name || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-700">Last Name</Label>
                      <p className="text-slate-900 font-medium">{profile?.last_name || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-700">Email</Label>
                      <p className="text-slate-900 font-medium">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-slate-700">Phone</Label>
                      <p className="text-slate-900 font-medium">{profile?.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-700">Date of Birth</Label>
                      <p className="text-slate-900 font-medium">
                        {profile?.date_of_birth
                          ? new Date(profile.date_of_birth).toLocaleDateString("de-DE")
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-700">Account Status</Label>
                      <p className="text-slate-900 font-medium">{profile?.account_status || "Active"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-semibold text-slate-900">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-700">Street Address</Label>
                        <p className="text-slate-900 font-medium">{profile?.address || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-slate-700">City</Label>
                        <p className="text-slate-900 font-medium">{profile?.city || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-slate-700">Postal Code</Label>
                        <p className="text-slate-900 font-medium">{profile?.postal_code || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-slate-700">Country</Label>
                        <p className="text-slate-900 font-medium">{profile?.country || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-semibold text-slate-900">Bank Accounts</h3>
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="p-4 bg-slate-50 rounded-md border border-slate-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900 capitalize">{account.account_type} Account</p>
                            <p className="text-sm text-slate-600">Account: {account.account_number}</p>
                            <p className="text-sm text-slate-600">Status: {account.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-serif font-bold text-slate-900">
                              {formatCurrency(account.balance, account.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <Card className="bg-white border border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-serif text-slate-900">Account Settings</CardTitle>
                  <CardDescription className="text-slate-600">
                    Manage your account preferences and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-semibold text-slate-900">Security</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Two-Factor Authentication
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-semibold text-slate-900">Notifications</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Email Notifications
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        SMS Alerts
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-semibold text-slate-900">Account</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Update Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white text-red-600 border-red-300 hover:bg-red-50"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Enhanced Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="font-serif text-slate-900">New Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="transfer-type" className="text-slate-700">
                Transaction Type
              </Label>
              <Select
                value={transferData.type}
                onValueChange={(value) => setTransferData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="transfer">Transfer Money</SelectItem>
                  <SelectItem value="deposit">Deposit Funds</SelectItem>
                  <SelectItem value="withdrawal">Withdraw Funds</SelectItem>
                  <SelectItem value="payment">Make Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount" className="text-slate-700">
                Amount (EUR)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={transferData.amount}
                onChange={(e) => setTransferData((prev) => ({ ...prev, amount: e.target.value }))}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <Label htmlFor="recipient" className="text-slate-700">
                Recipient
              </Label>
              <Input
                id="recipient"
                placeholder="Account number or email"
                value={transferData.recipient}
                onChange={(e) => setTransferData((prev) => ({ ...prev, recipient: e.target.value }))}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-slate-700">
                Description
              </Label>
              <Input
                id="description"
                placeholder="Payment description"
                value={transferData.description}
                onChange={(e) => setTransferData((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            {transferError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{transferError}</AlertDescription>
              </Alert>
            )}

            {transferSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{transferSuccess}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleTransfer}
              disabled={isTransferLoading || !transferData.amount || !transferData.recipient}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isTransferLoading ? "Processing..." : "Continue to Verification"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TransferPinDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onConfirm={handlePinVerifiedTransfer}
        transferData={pendingTransfer || transferData}
        isLoading={isTransferLoading}
        error={transferError}
      />
    </div>
  )
}
