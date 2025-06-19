"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAlert } from "@/hooks/useAlert"
import { AlertDialog } from "@/components/ui/alert-dialog"

export default function ManualUpdatePage() {
  const { alertState, hideAlert, showSuccess, showError, showWarning, showInfo } = useAlert()
  const [orderNumber, setOrderNumber] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("paid")
  const [orderStatus, setOrderStatus] = useState("confirmed")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const handleUpdate = async () => {
    if (!orderNumber) {
      showError("Input Required", "Order number is required")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/payment/manual-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_number: orderNumber,
          payment_status: paymentStatus,
          order_status: orderStatus,
        }),
      })

      const data = await response.json()
      setResult(data)
        if (data.success) {
        showSuccess("Update Successful", "Order status updated successfully!")
      } else {
        showError("Update Failed", "Failed to update: " + data.message)
      }    } catch (error) {
      console.error("Update error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setResult({ error: errorMessage })
      showError("Update Failed", "Update failed: " + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const quickUpdateRecentOrders = async () => {
    const recentOrders = [
      "LDY-20250619-0001",
      "LDY-20250619-0002", 
      "LDY-20250619-0003"
    ]

    setLoading(true)
    
    for (const orderNum of recentOrders) {
      try {
        const response = await fetch("/api/payment/manual-update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_number: orderNum,
            payment_status: "paid",
            order_status: "confirmed",
          }),
        })
        
        const data = await response.json()
        console.log(`Update ${orderNum}:`, data)
      } catch (error) {
        console.error(`Error updating ${orderNum}:`, error)
      }
    }
      setLoading(false)
    showSuccess("Bulk Update Complete", "Bulk update completed! Check console for details.")
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Manual Payment Status Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Use this page to manually update payment status for orders when webhook is not working in localhost environment.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Order Number
              </label>
              <Input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. LDY-20250619-0001"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Status
              </label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Order Status
              </label>
              <Select value={orderStatus} onValueChange={setOrderStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_process">In Process</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleUpdate} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Updating..." : "Update Status"}
              </Button>
              
              <Button 
                onClick={quickUpdateRecentOrders} 
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? "Updating..." : "Quick Update Recent Orders"}
              </Button>
            </div>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}        </CardContent>
      </Card>

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  )
}
