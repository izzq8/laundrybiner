"use client"

import { toast } from "sonner"

// Lebih sederhana, langsung mengexport toast dari sonner
export const useToast = () => {
  return {
    toast
  }
}
