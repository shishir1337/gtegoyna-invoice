import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

type InvoiceItem = {
  id: string
  description: string
  quantity: number
  price: number
}

type DiscountType = "none" | "percentage" | "fixed"

type InvoicePreviewProps = {
  invoiceData: {
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
  subtotal: number
  discountAmount: number
  total: number
}

export default function InvoicePreview({ invoiceData, subtotal, discountAmount, total }: InvoicePreviewProps) {
  return (
    <div className="bg-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image
              src="/logo.jpg"
              alt="G Te Goyna Logo"
              fill
              className="object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=160&width=160"
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">G Te Goyna</h1>
            <p className="text-xl">গ তে গয়না</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
          <p className="text-muted-foreground"># {invoiceData.invoiceNumber}</p>
          <p className="text-sm mt-1">Date: {new Date(invoiceData.date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
        <p className="font-medium">{invoiceData.customerName}</p>
        {invoiceData.customerAddress && (
          <p className="whitespace-pre-line text-muted-foreground">{invoiceData.customerAddress}</p>
        )}
        {invoiceData.customerPhone && <p className="text-muted-foreground">{invoiceData.customerPhone}</p>}
      </div>

      {/* Items Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-t">
              <th className="py-3 px-4 text-left bg-muted/50">Description</th>
              <th className="py-3 px-4 text-right bg-muted/50">Quantity</th>
              <th className="py-3 px-4 text-right bg-muted/50">Unit Price</th>
              <th className="py-3 px-4 text-right bg-muted/50">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3 px-4">{item.description}</td>
                <td className="py-3 px-4 text-right">{item.quantity}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.price)}</td>
                <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.quantity * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between py-2 border-b text-destructive">
              <span>
                Discount
                {invoiceData.discountType === "percentage" && ` (${invoiceData.discountValue}%)`}:
              </span>
              <span>- {formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between py-3 border-b border-black font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoiceData.notes && (
        <div className="mb-8 bg-muted/20 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Notes:</h3>
          <p className="text-muted-foreground whitespace-pre-line">{invoiceData.notes}</p>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="mb-8 border-t pt-6">
        <h3 className="text-lg font-semibold mb-3">Terms and Conditions:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>The jewellery contains 3 years colour guarantee.</li>
          <li>Please Check infront of delivery man and then pay the rest amount.</li>
          <li>Complaints will not be accepted once the delivery personnel have left.</li>
        </ol>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground mt-12 pt-6 border-t">
        <p>Thank you for your purchase! We appreciate your support.</p>
        <p className="mt-1">G Te Goyna | গ তে গয়না</p>
      </div>
    </div>
  )
}

