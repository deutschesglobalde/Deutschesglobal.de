"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, CheckCircle, AlertCircle, Fingerprint, Eye } from "lucide-react"

interface TransferPinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (pin: string) => void
  transferData: {
    amount: string
    recipient: string
    description: string
    type: string
  }
  isLoading?: boolean
  error?: string
}

export default function TransferPinDialog({
  open,
  onOpenChange,
  onConfirm,
  transferData,
  isLoading = false,
  error = "",
}: TransferPinDialogProps) {
  const [pin, setPin] = useState("")
  const [step, setStep] = useState<"pin" | "biometric" | "confirm">("pin")
  const [biometricStep, setBiometricStep] = useState(0)

  const formatCurrency = (amount: string) => {
    const num = Number.parseFloat(amount) || 0
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(num)
  }

  const handlePinComplete = (value: string) => {
    setPin(value)
    if (value.length === 4) {
      // Simulate PIN validation
      setTimeout(() => {
        setStep("biometric")
        simulateBiometricAuth()
      }, 500)
    }
  }

  const simulateBiometricAuth = () => {
    const steps = [
      { icon: <Fingerprint className="h-12 w-12" />, text: "Place your finger on the sensor" },
      { icon: <Eye className="h-12 w-12" />, text: "Look into the camera for facial recognition" },
      { icon: <Shield className="h-12 w-12 text-green-500" />, text: "Biometric verification successful!" },
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      setBiometricStep(currentStep)
      currentStep++

      if (currentStep >= steps.length) {
        clearInterval(interval)
        setTimeout(() => {
          setStep("confirm")
        }, 1000)
      }
    }, 1500)
  }

  const handleConfirm = () => {
    onConfirm(pin)
  }

  const handleCancel = () => {
    setPin("")
    setStep("pin")
    setBiometricStep(0)
    onOpenChange(false)
  }

  const biometricSteps = [
    { icon: <Fingerprint className="h-12 w-12" />, text: "Place your finger on the sensor" },
    { icon: <Eye className="h-12 w-12" />, text: "Look into the camera for facial recognition" },
    { icon: <Shield className="h-12 w-12 text-green-500" />, text: "Biometric verification successful!" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="font-serif text-slate-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Secure Transfer Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Summary */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-medium text-slate-900 mb-3">Transaction Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Amount:</span>
                <span className="font-medium text-slate-900">{formatCurrency(transferData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="font-medium text-slate-900 capitalize">{transferData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Recipient:</span>
                <span className="font-medium text-slate-900">{transferData.recipient}</span>
              </div>
              {transferData.description && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Description:</span>
                  <span className="font-medium text-slate-900">{transferData.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* PIN Entry Step */}
          {step === "pin" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium text-slate-900 mb-2">Enter Your 4-Digit PIN</h3>
                <p className="text-sm text-slate-600">Please enter your transaction PIN to continue</p>
              </div>

              <div className="flex justify-center">
                <InputOTP maxLength={4} value={pin} onChange={handlePinComplete} disabled={isLoading}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handlePinComplete(pin)}
                  disabled={pin.length !== 4 || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? "Verifying..." : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* Biometric Verification Step */}
          {step === "biometric" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-medium text-slate-900 mb-2">Biometric Verification</h3>
                <p className="text-sm text-slate-600">Additional security verification required</p>
              </div>

              <div className="flex flex-col items-center space-y-6 py-6">
                <div className="animate-pulse">{biometricSteps[biometricStep]?.icon}</div>
                <p className="text-center text-slate-600">{biometricSteps[biometricStep]?.text}</p>
                <div className="flex space-x-2">
                  {biometricSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index <= biometricStep ? "bg-blue-600" : "bg-slate-300"
                      } transition-colors`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Final Confirmation Step */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-2">Verification Complete</h3>
                <p className="text-sm text-slate-600">Ready to process your transaction</p>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  All security checks passed. Your transaction is ready to be submitted.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? "Processing..." : "Confirm Transfer"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
