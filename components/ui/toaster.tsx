"use client"

import * as React from "react"
import { Toaster as Sonner } from "sonner"

const Toaster = () => {
  return (
    <Sonner
      position="top-right"
      richColors
      theme="light"
      closeButton
      toastOptions={{
        style: {
          background: "#fff",
          color: "#333",
          border: "1px solid #eaeaea",
        },
      }}
    />
  )
}

export { Toaster }
