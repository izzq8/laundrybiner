// Types for Midtrans Snap
export interface MidtransSnapResult {
  order_id: string
  status_code: string
  gross_amount: string
  payment_type: string
  transaction_id: string
  transaction_status: string
  fraud_status?: string
  status_message?: string
  transaction_time?: string
}

export interface MidtransCallbacks {
  onSuccess?: (result: MidtransSnapResult) => void
  onPending?: (result: MidtransSnapResult) => void
  onError?: (result: MidtransSnapResult) => void
  onClose?: () => void
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: MidtransCallbacks | any) => void
    }
  }
}

export {}
