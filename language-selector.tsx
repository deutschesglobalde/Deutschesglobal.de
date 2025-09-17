"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"
import { languages, type Language, detectLanguage } from "@/lib/i18n"

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void
  className?: string
}

export function LanguageSelector({ onLanguageChange, className }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("de")

  useEffect(() => {
    setCurrentLanguage(detectLanguage())
  }, [])

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    localStorage.setItem("language", language)
    onLanguageChange?.(language)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32 bg-transparent border-muted-foreground/20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languages).map(([code, name]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
