"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageCircle, X, Send, User, Bot, Ticket } from "lucide-react"
import SupportTicketDialog from "./support-ticket-dialog"
import type { Language } from "@/lib/i18n"

interface ChatSupportProps {
  language: Language
}

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatSupport({ language }: ChatSupportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text:
        language === "de"
          ? "Hallo! Ich bin Ihr virtueller Banking-Assistent. Wie kann ich Ihnen heute helfen?"
          : "Hello! I'm your virtual banking assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const faqResponses = {
    de: {
      öffnungszeiten:
        "Unsere Online-Banking-Services sind 24/7 verfügbar. Unsere Filialen sind Mo-Fr 9:00-18:00 und Sa 9:00-13:00 geöffnet.",
      gebühren:
        "Wir bieten kostenlose Kontoführung für alle Privatkunden. Detaillierte Gebühreninformationen finden Sie in unserem Preis- und Leistungsverzeichnis.",
      "konto eröffnen":
        "Sie können Ihr kostenloses Konto online in nur wenigen Minuten eröffnen. Klicken Sie auf 'Konto eröffnen' oben rechts.",
      kreditkarte:
        "Wir bieten verschiedene Kreditkarten mit attraktiven Konditionen. Visa und Mastercard sind verfügbar.",
      "online banking":
        "Unser Online-Banking ist sicher und benutzerfreundlich. Sie können alle Bankgeschäfte bequem von zu Hause erledigen.",
      kontakt: "Sie erreichen uns telefonisch unter +49 (0) 69 910-00 oder per E-Mail an kontakt@deutscheglobal.de",
      sicherheit:
        "Wir verwenden modernste Sicherheitstechnologien einschließlich biometrischer Authentifizierung und Betrugsschutz.",
      konto:
        "Für kontospezifische Anfragen müssen Sie sich bitte zuerst anmelden. Klicken Sie auf 'Anmelden' oben rechts.",
      ticket:
        "Wenn ich Ihnen nicht weiterhelfen kann, können Sie gerne ein Support-Ticket erstellen. Möchten Sie ein Ticket erstellen?",
    },
    en: {
      hours:
        "Our online banking services are available 24/7. Our branches are open Mon-Fri 9:00-18:00 and Sat 9:00-13:00.",
      fees: "We offer free account management for all personal customers. Detailed fee information can be found in our price list.",
      "open account":
        "You can open your free account online in just a few minutes. Click 'Open Account' in the top right.",
      "credit card": "We offer various credit cards with attractive conditions. Visa and Mastercard are available.",
      "online banking":
        "Our online banking is secure and user-friendly. You can handle all banking transactions conveniently from home.",
      contact: "You can reach us by phone at +49 (0) 69 910-00 or by email at kontakt@deutscheglobal.de",
      security:
        "We use state-of-the-art security technologies including biometric authentication and fraud protection.",
      account: "For account-specific inquiries, please sign in first. Click 'Sign In' in the top right.",
      ticket:
        "If I can't help you further, you're welcome to create a support ticket. Would you like to create a ticket?",
    },
  }

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    const responses = faqResponses[language]

    // Check for ticket creation keywords
    const ticketKeywords =
      language === "de"
        ? ["ticket", "support", "hilfe", "problem", "beschwerde", "nicht funktioniert"]
        : ["ticket", "support", "help", "problem", "complaint", "not working", "issue"]

    if (ticketKeywords.some((keyword) => message.includes(keyword))) {
      return responses["ticket"]
    }

    // Check for account-related keywords
    const accountKeywords =
      language === "de"
        ? ["saldo", "kontostand", "überweisung", "transaktion", "geld", "einzahlung", "auszahlung"]
        : ["balance", "transfer", "transaction", "money", "deposit", "withdrawal", "account balance"]

    if (accountKeywords.some((keyword) => message.includes(keyword))) {
      return responses["konto"] || responses["account"]
    }

    // Check for FAQ matches
    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key)) {
        return response
      }
    }

    // Default response with ticket option
    return language === "de"
      ? "Entschuldigung, ich habe Ihre Frage nicht verstanden. Können Sie sie anders formulieren? Falls Sie weitere Hilfe benötigen, kann ich Ihnen dabei helfen, ein Support-Ticket zu erstellen."
      : "I'm sorry, I didn't understand your question. Could you rephrase it? If you need further assistance, I can help you create a support ticket."
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(currentMessage),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleCreateTicket = () => {
    setShowTicketDialog(true)
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0 bg-white">
          <DialogHeader className="p-4 border-b bg-blue-600 text-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {language === "de" ? "Banking-Assistent" : "Banking Assistant"}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateTicket}
                  className="text-white hover:bg-blue-700 text-xs"
                >
                  <Ticket className="h-4 w-4 mr-1" />
                  {language === "de" ? "Ticket" : "Ticket"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-blue-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "bot" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString(language === "de" ? "de-DE" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-slate-100 text-slate-900 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={language === "de" ? "Nachricht eingeben..." : "Type a message..."}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-white text-slate-900 border-slate-300"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SupportTicketDialog open={showTicketDialog} onOpenChange={setShowTicketDialog} language={language} />
    </>
  )
}
