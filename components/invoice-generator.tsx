"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Download, Edit, Calculator, ArrowRight, Loader2, FileText } from "lucide-react"
import InvoicePreview from "@/components/invoice-preview"
import { nanoid } from "nanoid"
import html2canvas from "html2canvas"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type InvoiceItem = {
  id: string
  description: string
  quantity: number
  price: number
}

type DiscountType = "none" | "percentage" | "fixed"

type InvoiceData = {
  invoiceNumber: string
  date: string
  customerName: string
  customerAddress: string
  customerPhone: string
  items: InvoiceItem[]
  discountType: DiscountType
  discountValue: number
  notes: string
}

export default function InvoiceGenerator() {
  const [step, setStep] = useState<1 | 2>(1)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    items: [{ id: nanoid(), description: "", quantity: 1, price: 0 }],
    discountType: "none",
    discountValue: 0,
    notes: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Generate sequential invoice number on component mount and load saved invoices
  useEffect(() => {
    generateInvoiceNumber()
    loadSavedInvoices()
  }, [])

  const loadSavedInvoices = () => {
    setIsLoadingSaved(true)
    try {
      const savedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]")
      setSavedInvoices(savedInvoices)
    } catch (error) {
      console.error("Error loading saved invoices:", error)
      toast({
        variant: "destructive",
        title: "Error loading invoices",
        description: "There was a problem loading your saved invoices.",
      })
    } finally {
      setIsLoadingSaved(false)
    }
  }

  const generateInvoiceNumber = () => {
    try {
      // Get the last invoice number from localStorage
      const savedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]")
      let lastNumber = 0

      if (savedInvoices.length > 0) {
        // Extract the number from the last invoice
        const lastInvoice = savedInvoices[savedInvoices.length - 1]
        const match = lastInvoice.invoiceNumber.match(/(\d+)$/)
        if (match) {
          lastNumber = Number.parseInt(match[1], 10)
        }
      }

      // Generate new invoice number with leading zeros
      const newNumber = (lastNumber + 1).toString().padStart(4, "0")
      setInvoiceData((prev) => ({ ...prev, invoiceNumber: `INV-${newNumber}` }))
    } catch (error) {
      console.error("Error generating invoice number:", error)
      // Fallback to timestamp-based number if there's an error
      const timestamp = Date.now().toString().slice(-6)
      setInvoiceData((prev) => ({ ...prev, invoiceNumber: `INV-${timestamp}` }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setInvoiceData({ ...invoiceData, [name]: value })
  }

  const handleDiscountTypeChange = (value: DiscountType) => {
    setInvoiceData({
      ...invoiceData,
      discountType: value,
      // Reset discount value when changing type
      discountValue: value === "none" ? 0 : invoiceData.discountValue,
    })
  }

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0

    // For percentage, limit to 100%
    if (invoiceData.discountType === "percentage" && value > 100) {
      setInvoiceData({ ...invoiceData, discountValue: 100 })
    } else {
      setInvoiceData({ ...invoiceData, discountValue: value })
    }
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    })
  }

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { id: nanoid(), description: "", quantity: 1, price: 0 }],
    })
  }

  const removeItem = (id: string) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.filter((item) => item.id !== id),
      })
    }
  }

  const saveInvoice = () => {
    try {
      // Store in localStorage
      const existingInvoices = JSON.parse(localStorage.getItem("invoices") || "[]")
      const updatedInvoices = [...existingInvoices, invoiceData]
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices))
      setSavedInvoices(updatedInvoices)

      toast({
        title: "Invoice saved",
        description: `Invoice ${invoiceData.invoiceNumber} has been saved successfully.`,
      })

      // Reset form and generate new invoice number for next invoice
      setInvoiceData({
        invoiceNumber: "",
        date: new Date().toISOString().split("T")[0],
        customerName: "",
        customerAddress: "",
        customerPhone: "",
        items: [{ id: nanoid(), description: "", quantity: 1, price: 0 }],
        discountType: "none",
        discountValue: 0,
        notes: "",
      })

      generateInvoiceNumber()
      setStep(1)
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast({
        variant: "destructive",
        title: "Error saving invoice",
        description: "There was a problem saving your invoice. Please try again.",
      })
    }
  }

  const loadInvoice = (invoice: InvoiceData) => {
    setInvoiceData(invoice)
    setStep(1)
    toast({
      title: "Invoice loaded",
      description: `Invoice ${invoice.invoiceNumber} has been loaded.`,
    })
  }

  const deleteInvoice = (invoiceNumber: string) => {
    try {
      const existingInvoices = JSON.parse(localStorage.getItem("invoices") || "[]")
      const updatedInvoices = existingInvoices.filter((invoice: InvoiceData) => invoice.invoiceNumber !== invoiceNumber)
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices))
      setSavedInvoices(updatedInvoices)

      toast({
        title: "Invoice deleted",
        description: `Invoice ${invoiceNumber} has been deleted.`,
      })
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        variant: "destructive",
        title: "Error deleting invoice",
        description: "There was a problem deleting the invoice. Please try again.",
      })
    }
  }

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((total, item) => total + item.quantity * item.price, 0)
  }

  const calculateDiscountAmount = (subtotal: number) => {
    if (invoiceData.discountType === "none" || invoiceData.discountValue <= 0) {
      return 0
    }

    if (invoiceData.discountType === "percentage") {
      return subtotal * (invoiceData.discountValue / 100)
    }

    // Fixed amount discount
    return Math.min(subtotal, invoiceData.discountValue) // Don't allow discount greater than subtotal
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = calculateDiscountAmount(subtotal)
    return subtotal - discountAmount
  }

  const handlePreview = () => {
    setStep(2)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleEdit = () => {
    setStep(1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const downloadImage = async () => {
    if (!invoiceRef.current) return

    setIsGenerating(true)

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      // Create a download link for the image
      const link = document.createElement("a")
      link.download = `G-Te-Goyna-Invoice-${invoiceData.invoiceNumber}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast({
        title: "Invoice downloaded",
        description: "Your invoice has been downloaded as an image.",
      })

      // Save the invoice after successful download
      saveInvoice()
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was a problem generating the invoice image. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const isFormValid = () => {
    return (
      invoiceData.customerName.trim() !== "" &&
      invoiceData.items.every((item) => item.description.trim() !== "" && item.quantity > 0 && item.price > 0)
    )
  }

  const subtotal = calculateSubtotal()
  const discountAmount = calculateDiscountAmount(subtotal)
  const total = calculateTotal()

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm font-medium">
          <span className={step === 1 ? "text-primary font-semibold" : "text-muted-foreground"}>Enter Details</span>
          <span className={step === 2 ? "text-primary font-semibold" : "text-muted-foreground"}>
            Preview & Download
          </span>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="h-2" />
      </div>

      {/* Saved Invoices Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4 w-full sm:w-auto">
            <FileText className="mr-2 h-4 w-4" /> Saved Invoices
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Saved Invoices</DialogTitle>
            <DialogDescription>View and manage your previously saved invoices.</DialogDescription>
          </DialogHeader>

          {isLoadingSaved ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : savedInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No saved invoices found.</div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              {savedInvoices.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()} -{" "}
                      {formatCurrency(
                        invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0) -
                          calculateDiscountAmount(
                            invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
                          ),
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => loadInvoice(invoice)}>
                      Load
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteInvoice(invoice.invoiceNumber)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  localStorage.removeItem("invoices")
                  setSavedInvoices([])
                  toast({
                    title: "All invoices deleted",
                    description: "All saved invoices have been deleted.",
                  })
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to delete invoices.",
                  })
                }
              }}
              disabled={savedInvoices.length === 0}
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {step === 1 ? (
        <div className="space-y-6 fade-in">
          <Card className="p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Auto-generated</p>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" value={invoiceData.date} onChange={handleInputChange} />
              </div>
            </div>

            <h3 className="text-lg font-medium mb-2 mt-6">Customer Information</h3>
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="customerName">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={invoiceData.customerName}
                  onChange={handleInputChange}
                  placeholder="Customer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerAddress">Address</Label>
                <Textarea
                  id="customerAddress"
                  name="customerAddress"
                  value={invoiceData.customerAddress}
                  onChange={handleInputChange}
                  placeholder="Customer address"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={invoiceData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="Customer phone"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium mb-2 mt-6">
              Items <span className="text-destructive">*</span>
            </h3>
            <div className="space-y-4 mb-6">
              {invoiceData.items.map((item, index) => (
                <div key={item.id} className="p-3 border rounded-md bg-background">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6">
                      <Label htmlFor={`item-${index}-desc`}>
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`item-${index}-desc`}
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`item-${index}-qty`}>
                        Qty <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`item-${index}-qty`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor={`item-${index}-price`}>
                        Price <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`item-${index}-price`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={invoiceData.items.length === 1}
                        className="h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            <h3 className="text-lg font-medium mb-2 mt-6">Discount</h3>
            <div className="p-4 border rounded-md bg-background mb-6">
              <RadioGroup
                value={invoiceData.discountType}
                onValueChange={(value) => handleDiscountTypeChange(value as DiscountType)}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="discount-none" />
                  <Label htmlFor="discount-none" className="cursor-pointer">
                    No Discount
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="discount-percentage" />
                  <Label htmlFor="discount-percentage" className="cursor-pointer">
                    Percentage (%)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="discount-fixed" />
                  <Label htmlFor="discount-fixed" className="cursor-pointer">
                    Fixed Amount
                  </Label>
                </div>
              </RadioGroup>

              {invoiceData.discountType !== "none" && (
                <div className="mt-4">
                  <Label htmlFor="discountValue">
                    {invoiceData.discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
                  </Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      step={invoiceData.discountType === "percentage" ? "1" : "0.01"}
                      max={invoiceData.discountType === "percentage" ? "100" : undefined}
                      value={invoiceData.discountValue}
                      onChange={handleDiscountValueChange}
                      className="w-full"
                    />
                    {invoiceData.discountType === "percentage" && <span className="ml-2 text-muted-foreground">%</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={invoiceData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes or payment instructions"
                rows={3}
              />
            </div>
          </Card>

          {/* Order Summary Card */}
          <Card className="p-4 md:p-6 bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calculator className="mr-2 h-5 w-5" /> Order Summary
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {invoiceData.discountType !== "none" && (
                <div className="flex justify-between text-destructive">
                  <span>
                    Discount
                    {invoiceData.discountType === "percentage" && ` (${invoiceData.discountValue}%)`}
                  </span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button onClick={handlePreview} className="w-full mt-6" size="lg" disabled={!isFormValid()}>
              Preview Invoice <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 fade-in">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h2 className="text-xl font-semibold">Invoice Preview</h2>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button variant="outline" onClick={handleEdit} className="text-sm">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button onClick={downloadImage} className="text-sm" disabled={isGenerating}>
                  <Download className="mr-2 h-4 w-4" />
                  {isGenerating ? "Generating Image..." : "Download Image"}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <div ref={invoiceRef}>
                <InvoicePreview
                  invoiceData={invoiceData}
                  subtotal={subtotal}
                  discountAmount={discountAmount}
                  total={total}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit Invoice
              </Button>
              <Button onClick={downloadImage} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

