"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Heart, Truck, Sparkles } from "lucide-react"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: FeedbackData) => Promise<void>
  orderNumber: string
  loading?: boolean
}

interface FeedbackData {
  rating: number
  comment: string
  serviceRating: number
  deliveryRating: number
  qualityRating: number
}

export function FeedbackModal({ isOpen, onClose, onSubmit, orderNumber, loading = false }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    comment: "",
    serviceRating: 0,
    deliveryRating: 0,
    qualityRating: 0
  })

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (feedback.rating === 0) {
      alert("Mohon berikan rating keseluruhan")
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(feedback)
      // Reset form after successful submission
      setFeedback({
        rating: 0,
        comment: "",
        serviceRating: 0,
        deliveryRating: 0,
        qualityRating: 0
      })
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ 
    rating, 
    onChange, 
    label, 
    icon: Icon = Star 
  }: { 
    rating: number
    onChange: (rating: number) => void
    label: string
    icon?: React.ComponentType<any>
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`transition-colors ${
              star <= rating
                ? "text-yellow-400 hover:text-yellow-500"
                : "text-gray-300 hover:text-gray-400"
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>Feedback Pesanan</span>
            </div>
            <p className="text-sm text-gray-600 font-normal">
              {orderNumber}
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <StarRating
            rating={feedback.rating}
            onChange={(rating) => setFeedback(prev => ({ ...prev, rating }))}
            label="Rating Keseluruhan *"
          />

          {/* Service Rating */}
          <StarRating
            rating={feedback.serviceRating}
            onChange={(rating) => setFeedback(prev => ({ ...prev, serviceRating: rating }))}
            label="Kualitas Pelayanan"
            icon={Heart}
          />

          {/* Delivery Rating */}
          <StarRating
            rating={feedback.deliveryRating}
            onChange={(rating) => setFeedback(prev => ({ ...prev, deliveryRating: rating }))}
            label="Pengantaran/Penjemputan"
            icon={Truck}
          />

          {/* Quality Rating */}
          <StarRating
            rating={feedback.qualityRating}
            onChange={(rating) => setFeedback(prev => ({ ...prev, qualityRating: rating }))}
            label="Hasil Pencucian"
            icon={Sparkles}
          />

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Komentar Tambahan
            </label>
            <Textarea
              placeholder="Ceritakan pengalaman Anda menggunakan layanan kami..."
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {feedback.comment.length}/500
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={submitting || feedback.rating === 0}
            >
              {submitting ? "Mengirim..." : "Kirim Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
