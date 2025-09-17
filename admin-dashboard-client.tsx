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
import { Textarea } from "@/components/ui/textarea"
import { LanguageSelector } from "@/components/language-selector"
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Search,
  Download,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  DollarSign,
  Activity,
  Clock,
  User,
  Globe,
} from "lucide-react"
import { translations, formatCurrency, currencies, type Language, type Currency } from "@/lib/i18n"

interface AdminDashboardClientProps {
  profiles: any[]
  transactions: any[]
  bankAccounts: any[]
}

export default function AdminDashboardClient({ profiles, transactions, bankAccounts }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [language, setLanguage] = useState<Language>("de")
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>("EUR")
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [newAccountCurrency, setNewAccountCurrency] = useState<Currency>("EUR")
  const router = useRouter()
  const supabase = createClient()

  const t = translations[language]

  const handleSignOut = () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/")
  }

  const handleTransactionAction = async (transactionId: string, action: "approved" | "declined") => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          action,
          adminNotes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process transaction")
      }

      setSelectedTransaction(null)
      setAdminNotes("")
      router.refresh()
    } catch (error) {
      console.error("Transaction action error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrencyAmount = (amount: number, currency: Currency = defaultCurrency) => {
    const locale = language === "de" ? "de-DE" : "en-US"
    return formatCurrency(amount, currency, locale)
  }

  const formatDate = (dateString: string) => {
    const locale = language === "de" ? "de-DE" : "en-US"
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCurrencyChange = async (accountId: string, newCurrency: Currency) => {
    try {
      const response = await fetch("/api/admin/accounts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          currency: newCurrency,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update account currency")
      }

      setEditingAccount(null)
      router.refresh()
    } catch (error) {
      console.error("Currency update error:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-700 border-green-500/30",
      declined: "bg-red-500/20 text-red-700 border-red-500/30",
      completed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    }

    const statusText =
      language === "de"
        ? {
            pending: "Ausstehend",
            approved: "Genehmigt",
            declined: "Abgelehnt",
            completed: "Abgeschlossen",
          }
        : {
            pending: "Pending",
            approved: "Approved",
            declined: "Declined",
            completed: "Completed",
          }

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {statusText[status as keyof typeof statusText] || status}
      </Badge>
    )
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || transaction.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const pendingTransactions = transactions.filter((t) => t.status === "pending")
  const totalUsers = profiles.length
  const totalBalance = bankAccounts.reduce((sum, account) => {
    // Convert all balances to default currency for display (simplified conversion)
    const balance = Number(account.balance)
    return sum + balance
  }, 0)
  const totalTransactions = transactions.length

  const sidebarItems = [
    { id: "overview", label: language === "de" ? "Übersicht" : "Overview", icon: <TrendingUp className="h-5 w-5" /> },
    {
      id: "transactions",
      label: language === "de" ? "Transaktionen" : "Transactions",
      icon: <CreditCard className="h-5 w-5" />,
    },
    { id: "users", label: language === "de" ? "Benutzer" : "Users", icon: <Users className="h-5 w-5" /> },
    { id: "accounts", label: language === "de" ? "Konten" : "Accounts", icon: <Building2 className="h-5 w-5" /> },
    { id: "settings", label: language === "de" ? "Einstellungen" : "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-slate-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center gap-3">
                <img src="/images/deutsche-bank-logo.png" alt="Deutsche Bank" className="h-8 w-auto object-contain" />
                <span className="text-lg sm:text-xl font-serif font-bold text-slate-900 hidden sm:block">
                  {language === "de" ? "Admin Dashboard" : "Admin Dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block">
                <LanguageSelector onLanguageChange={setLanguage} />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-600" />
                <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                  <SelectTrigger className="w-16 sm:w-20 bg-transparent border-slate-300 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencies).map(([code, currency]) => (
                      <SelectItem key={code} value={code}>
                        {currency.symbol} {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs px-2 py-1">
                {pendingTransactions.length}
                <span className="hidden sm:inline ml-1">{language === "de" ? "Ausstehend" : "Pending"}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline ml-2">{language === "de" ? "Abmelden" : "Sign Out"}</span>
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
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out`}
          >
            {/* Mobile overlay */}
            {mobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setMobileMenuOpen(false)} />
            )}

            <div className="p-6 pt-20 lg:pt-6 relative z-30 bg-white h-full">
              <div className="sm:hidden mb-4 pb-4 border-b border-slate-200">
                <LanguageSelector onLanguageChange={setLanguage} />
              </div>

              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white shadow-md"
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
          <main className="flex-1 min-w-0">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2 text-slate-900">
                    {language === "de" ? "Admin Übersicht" : "Admin Overview"}
                  </h1>
                  <p className="text-slate-600 text-sm sm:text-base">
                    {language === "de"
                      ? "Verwalten Sie Ihr Banking-System und überwachen Sie alle Aktivitäten."
                      : "Manage your banking system and monitor all activities."}
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-slate-600 truncate">
                            {language === "de" ? "Benutzer" : "Users"}
                          </p>
                          <p className="text-xl sm:text-3xl font-serif font-bold text-slate-900">{totalUsers}</p>
                        </div>
                        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-slate-600 truncate">
                            {language === "de" ? "Saldo" : "Balance"}
                          </p>
                          <p className="text-lg sm:text-3xl font-serif font-bold text-slate-900 truncate">
                            {formatCurrencyAmount(totalBalance)}
                          </p>
                        </div>
                        <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-slate-600 truncate">
                            {language === "de" ? "Ausstehend" : "Pending"}
                          </p>
                          <p className="text-xl sm:text-3xl font-serif font-bold text-slate-900">
                            {pendingTransactions.length}
                          </p>
                        </div>
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-slate-600 truncate">
                            {language === "de" ? "Gesamt" : "Total"}
                          </p>
                          <p className="text-xl sm:text-3xl font-serif font-bold text-slate-900">{totalTransactions}</p>
                        </div>
                        <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pending Transactions */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="font-serif text-slate-900 text-lg sm:text-xl">
                      {language === "de" ? "Ausstehende Transaktionen" : "Pending Transactions"}
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-sm">
                      {language === "de"
                        ? "Transaktionen, die eine Admin-Genehmigung benötigen"
                        : "Transactions requiring admin approval"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    {pendingTransactions.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {pendingTransactions.slice(0, 5).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-md bg-slate-50 border border-slate-200 gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                                  {transaction.description || `${transaction.transaction_type} transaction`}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-600 truncate">
                                  {transaction.profiles?.email}
                                </p>
                                <p className="text-xs text-slate-500">{formatDate(transaction.created_at)}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                              <p className="font-medium text-slate-900 text-sm sm:text-base">
                                {formatCurrencyAmount(transaction.amount, transaction.currency || defaultCurrency)}
                              </p>
                              <Button
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 py-2"
                              >
                                {language === "de" ? "Prüfen" : "Review"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <p className="text-slate-600 text-sm sm:text-base">
                          {language === "de" ? "Keine ausstehenden Transaktionen" : "No pending transactions"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2 text-slate-900">
                      {language === "de" ? "Alle Transaktionen" : "All Transactions"}
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base">
                      {language === "de"
                        ? "Alle Banking-Transaktionen verwalten und überprüfen"
                        : "Manage and review all banking transactions"}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="bg-transparent text-xs sm:text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      {language === "de" ? "Exportieren" : "Export"}
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder={language === "de" ? "Transaktionen suchen..." : "Search transactions..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "de" ? "Alle Status" : "All Status"}</SelectItem>
                      <SelectItem value="pending">{language === "de" ? "Ausstehend" : "Pending"}</SelectItem>
                      <SelectItem value="approved">{language === "de" ? "Genehmigt" : "Approved"}</SelectItem>
                      <SelectItem value="declined">{language === "de" ? "Abgelehnt" : "Declined"}</SelectItem>
                      <SelectItem value="completed">{language === "de" ? "Abgeschlossen" : "Completed"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transactions List */}
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-0">
                    <div className="space-y-0">
                      {filteredTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-200 last:border-b-0 gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                                {transaction.description || `${transaction.transaction_type} transaction`}
                              </p>
                              <p className="text-xs sm:text-sm text-slate-600 truncate">
                                {transaction.profiles?.email}
                              </p>
                              <p className="text-xs text-slate-500">{formatDate(transaction.created_at)}</p>
                              <p className="text-xs text-slate-500">ID: {transaction.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                            <div className="text-left sm:text-right">
                              <p className="font-medium text-slate-900 text-sm sm:text-base">
                                {formatCurrencyAmount(transaction.amount)}
                              </p>
                              <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTransaction(transaction)}
                              className="bg-transparent p-2"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold mb-2 text-slate-900">User Management</h1>
                  <p className="text-slate-600">View and manage all registered users</p>
                </div>

                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-0">
                    <div className="space-y-0">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between p-4 border-b border-slate-200 last:border-b-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {profile.first_name} {profile.last_name}
                              </p>
                              <p className="text-sm text-slate-600">{profile.email}</p>
                              <p className="text-xs text-slate-500">Joined: {formatDate(profile.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-slate-600">{profile.bank_accounts?.length || 0} Account(s)</p>
                              <Badge
                                className={
                                  profile.account_status === "active"
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : "bg-red-100 text-red-800 border-red-300"
                                }
                              >
                                {profile.account_status || "Active"}
                              </Badge>
                            </div>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Accounts Tab */}
            {activeTab === "accounts" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold mb-2 text-slate-900">
                    {language === "de" ? "Bankkonten" : "Bank Accounts"}
                  </h1>
                  <p className="text-slate-600">
                    {language === "de"
                      ? "Überwachen Sie alle Bankkonten und Salden"
                      : "Monitor all bank accounts and balances"}
                  </p>
                </div>

                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-0">
                    <div className="space-y-0">
                      {bankAccounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-4 border-b border-slate-200 last:border-b-0"
                        >
                          <div className="flex items-center gap-4">
                            <CreditCard className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-medium text-slate-900 capitalize">
                                {account.account_type} {language === "de" ? "Konto" : "Account"}
                              </p>
                              <p className="text-sm text-slate-600">
                                {account.profiles?.first_name} {account.profiles?.last_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {language === "de" ? "Konto" : "Account"}: {account.account_number}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-serif font-bold text-slate-900">
                                {formatCurrencyAmount(account.balance, account.currency)}
                              </p>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(account.status)}
                                <Badge variant="outline" className="text-xs">
                                  {account.currency}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => setEditingAccount(account)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold mb-2 text-slate-900">
                    {language === "de" ? "Admin Einstellungen" : "Admin Settings"}
                  </h1>
                  <p className="text-slate-600">
                    {language === "de"
                      ? "Systemeinstellungen und Präferenzen konfigurieren"
                      : "Configure system settings and preferences"}
                  </p>
                </div>

                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="font-serif text-slate-900">
                      {language === "de" ? "Systemkonfiguration" : "System Configuration"}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {language === "de" ? "Banking-System-Einstellungen verwalten" : "Manage banking system settings"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-serif font-semibold text-slate-900">
                        {language === "de" ? "Währungseinstellungen" : "Currency Settings"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-700">
                            {language === "de" ? "Standard-Währung" : "Default Currency"}
                          </Label>
                          <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(currencies).map(([code, currency]) => (
                                <SelectItem key={code} value={code}>
                                  {currency.symbol} {code} - {currency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {language === "de" ? "Unterstützte Währungen" : "Supported Currencies"}
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(currencies).map(([code, currency]) => (
                              <Badge key={code} variant="outline" className="text-xs">
                                {currency.symbol} {code}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-serif font-semibold text-slate-900">
                        {language === "de" ? "Transaktionseinstellungen" : "Transaction Settings"}
                      </h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {language === "de" ? "Auto-Genehmigungslimits" : "Auto-approval Limits"}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {language === "de" ? "Transaktionsgebühren" : "Transaction Fees"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-serif font-semibold text-slate-900">
                        {language === "de" ? "Sicherheit" : "Security"}
                      </h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {language === "de" ? "Admin-Zugriffsprotokolle" : "Admin Access Logs"}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {language === "de" ? "System-Backup" : "System Backup"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg sm:text-xl">
              {language === "de" ? "Konto bearbeiten" : "Edit Account"}
            </DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{language === "de" ? "Kontoinhaber" : "Account Holder"}</Label>
                <p className="text-sm text-slate-600 break-words">
                  {editingAccount.profiles?.first_name} {editingAccount.profiles?.last_name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">{language === "de" ? "Kontonummer" : "Account Number"}</Label>
                <p className="text-sm text-slate-600 break-all">{editingAccount.account_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {language === "de" ? "Aktueller Saldo" : "Current Balance"}
                </Label>
                <p className="text-sm text-slate-600">
                  {formatCurrencyAmount(editingAccount.balance, editingAccount.currency)}
                </p>
              </div>
              <div>
                <Label htmlFor="account-currency">{language === "de" ? "Währung ändern" : "Change Currency"}</Label>
                <Select value={newAccountCurrency} onValueChange={setNewAccountCurrency}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencies).map(([code, currency]) => (
                      <SelectItem key={code} value={code} className="text-sm">
                        {currency.symbol} {code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleCurrencyChange(editingAccount.id, newAccountCurrency)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  {language === "de" ? "Speichern" : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditingAccount(null)} className="flex-1 text-sm">
                  {language === "de" ? "Abbrechen" : "Cancel"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg sm:text-xl">
              {language === "de" ? "Transaktion prüfen" : "Review Transaction"}
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    {language === "de" ? "Transaktions-ID" : "Transaction ID"}
                  </Label>
                  <p className="text-sm text-slate-600 break-all">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{language === "de" ? "Typ" : "Type"}</Label>
                  <p className="text-sm text-slate-600 capitalize">{selectedTransaction.transaction_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{language === "de" ? "Betrag" : "Amount"}</Label>
                  <p className="text-sm text-slate-600">
                    {formatCurrencyAmount(selectedTransaction.amount, selectedTransaction.currency || defaultCurrency)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">{language === "de" ? "Benutzer" : "User"}</Label>
                  <p className="text-sm text-slate-600 break-words">{selectedTransaction.profiles?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{language === "de" ? "Datum" : "Date"}</Label>
                  <p className="text-sm text-slate-600">{formatDate(selectedTransaction.created_at)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">{language === "de" ? "Beschreibung" : "Description"}</Label>
                <p className="text-sm text-slate-600 break-words">
                  {selectedTransaction.description ||
                    (language === "de" ? "Keine Beschreibung angegeben" : "No description provided")}
                </p>
              </div>

              <div>
                <Label htmlFor="admin-notes">{language === "de" ? "Admin-Notizen" : "Admin Notes"}</Label>
                <Textarea
                  id="admin-notes"
                  placeholder={
                    language === "de"
                      ? "Notizen zu dieser Transaktion hinzufügen..."
                      : "Add notes about this transaction..."
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>

              {selectedTransaction.status === "pending" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleTransactionAction(selectedTransaction.id, "approved")}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isProcessing
                      ? language === "de"
                        ? "Verarbeitung..."
                        : "Processing..."
                      : language === "de"
                        ? "Genehmigen"
                        : "Approve"}
                  </Button>
                  <Button
                    onClick={() => handleTransactionAction(selectedTransaction.id, "declined")}
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1 text-sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {isProcessing
                      ? language === "de"
                        ? "Verarbeitung..."
                        : "Processing..."
                      : language === "de"
                        ? "Ablehnen"
                        : "Decline"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
