"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Ticket, CheckCircle, AlertCircle } from "lucide-react"

interface SupportTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: "de" | "en"
}

export default function SupportTicketDialog({ open, onOpenChange, language }: SupportTicketDialogProps) {
  const [ticketData, setTicketData] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const t = {
    de: {
      title: "Support-Ticket erstellen",
      ticketTitle: "Titel",
      titlePlaceholder: "Kurze Beschreibung Ihres Problems",
      description: "Beschreibung",
      descriptionPlaceholder: "Detaillierte Beschreibung Ihres Anliegens...",
      category: "Kategorie",
      priority: "Priorität",
      categories: {
        account: "Konto",
        transaction: "Transaktion",
        technical: "Technisch",
        general: "Allgemein",
        complaint: "Beschwerde",
      },
      priorities: {
        low: "Niedrig",
        medium: "Mittel",
        high: "Hoch",
        urgent: "Dringend",
      },
      submit: "Ticket erstellen",
      submitting: "Wird erstellt...",
      cancel: "Abbrechen",
      successMessage: "Ihr Support-Ticket wurde erfolgreich erstellt. Sie erhalten eine E-Mail mit der Ticket-Nummer.",
      errorMessage: "Fehler beim Erstellen des Tickets. Bitte versuchen Sie es erneut.",
    },
    en: {
      title: "Create Support Ticket",
      ticketTitle: "Title",
      titlePlaceholder: "Brief description of your issue",
      description: "Description",
      descriptionPlaceholder: "Detailed description of your concern...",
      category: "Category",
      priority: "Priority",
      categories: {
        account: "Account",
        transaction: "Transaction",
        technical: "Technical",
        general: "General",
        complaint: "Complaint",
      },
      priorities: {
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Urgent",
      },
      submit: "Create Ticket",
      submitting: "Creating...",
      cancel: "Cancel",
      successMessage:
        "Your support ticket has been created successfully. You will receive an email with the ticket number.",
      errorMessage: "Error creating ticket. Please try again.",
    },
  }

  const text = t[language]

  const handleSubmit = async () => {
    if (!ticketData.title.trim() || !ticketData.description.trim()) {
      setError(language === "de" ? "Bitte füllen Sie alle Felder aus." : "Please fill in all fields.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || text.errorMessage)
      }

      setSuccess(text.successMessage)
      setTicketData({ title: "", description: "", category: "general", priority: "medium" })

      setTimeout(() => {
        onOpenChange(false)
        setSuccess("")
      }, 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : text.errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTicketData({ title: "", description: "", category: "general", priority: "medium" })
    setError("")
    setSuccess("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="font-serif text-slate-900 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-600" />
            {text.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ticket-title" className="text-slate-700">
              {text.ticketTitle}
            </Label>
            <Input
              id="ticket-title"
              placeholder={text.titlePlaceholder}
              value={ticketData.title}
              onChange={(e) => setTicketData((prev) => ({ ...prev, title: e.target.value }))}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-slate-700">
                {text.category}
              </Label>
              <Select
                value={ticketData.category}
                onValueChange={(value) => setTicketData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(text.categories).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-slate-700">
                {text.priority}
              </Label>
              <Select
                value={ticketData.priority}
                onValueChange={(value) => setTicketData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(text.priorities).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-700">
              {text.description}
            </Label>
            <Textarea
              id="description"
              placeholder={text.descriptionPlaceholder}
              value={ticketData.description}
              onChange={(e) => setTicketData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              {text.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !ticketData.title.trim() || !ticketData.description.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? text.submitting : text.submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
