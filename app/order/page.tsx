"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Phone, User, Package, Minus, Plus, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface ServiceType {
  id: string
  name: string
  type: 'kiloan' | 'satuan'
  price: number
  description: string
}

interface ItemType {
  id: string
  name: string
  price: number
  category: string
}

interface OrderItem {
  itemTypeId: string
  itemName: string
  quantity: number
  pricePerItem: number
  totalPrice: number
}

interface OrderFormData {
  serviceType: 'kiloan' | 'satuan'
  serviceTypeId: string
  weight: number
  items: OrderItem[]
  pickupAddress: string
  pickupDate: string
  pickupTime: string
  contactName: string
  contactPhone: string
  notes: string
}

export default function OrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [itemTypes, setItemTypes] = useState<ItemType[]>([])
  const [orderData, setOrderData] = useState<OrderFormData>({
    serviceType: 'kiloan',
    serviceTypeId: '',
    weight: 1,
    items: [],
    pickupAddress: '',
    pickupDate: '',
    pickupTime: '',
    contactName: '',
    contactPhone: '',
    notes: ''
  })

  const pickupFee = 5000
  const deliveryFee = 5000
  useEffect(() => {
    fetchServiceTypes()
    fetchItemTypes()
    
    // Set default pickup date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setOrderData(prev => ({
      ...prev,
      pickupDate: tomorrow.toISOString().split('T')[0]
    }))
  }, [])

  const fetchServiceTypes = async () => {
    try {
      const response = await fetch('/api/service-types')
      
      if (response.ok) {
        const data = await response.json()
        setServiceTypes(data.data || [])
      } else {
        console.error('Failed to fetch service types:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching service types:', error)
    }
  }

  const fetchItemTypes = async () => {
    try {
      const response = await fetch('/api/item-types')
      if (response.ok) {
        const data = await response.json()
        setItemTypes(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching item types:', error)
    }
  }

  const handleServiceTypeChange = (serviceType: 'kiloan' | 'satuan') => {
    setOrderData(prev => ({
      ...prev,
      serviceType,
      serviceTypeId: '',
      items: serviceType === 'kiloan' ? [] : prev.items
    }))
  }

  const handleServiceTypeIdChange = (serviceTypeId: string) => {
    setOrderData(prev => ({
      ...prev,
      serviceTypeId
    }))
  }

  const addItem = () => {
    const newItem: OrderItem = {
      itemTypeId: '',
      itemName: '',
      quantity: 1,
      pricePerItem: 0,
      totalPrice: 0
    }
    
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    setOrderData(prev => {
      const newItems = [...prev.items]
      
      if (field === 'itemTypeId') {
        const itemType = itemTypes.find(item => item.id === value)
        if (itemType) {
          newItems[index] = {
            ...newItems[index],
            itemTypeId: value,
            itemName: itemType.name,
            pricePerItem: itemType.price,
            totalPrice: itemType.price * newItems[index].quantity
          }
        }
      } else if (field === 'quantity') {
        const quantity = Math.max(1, parseInt(value) || 1)
        newItems[index] = {
          ...newItems[index],
          quantity,
          totalPrice: newItems[index].pricePerItem * quantity
        }
      } else {
        newItems[index] = {
          ...newItems[index],
          [field]: value
        }
      }
      
      return {
        ...prev,
        items: newItems
      }
    })
  }

  const removeItem = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateSubtotal = () => {
    if (orderData.serviceType === 'kiloan') {
      const selectedService = serviceTypes.find(s => s.id === orderData.serviceTypeId)
      return selectedService ? selectedService.price * orderData.weight : 0
    } else {
      return orderData.items.reduce((total, item) => total + item.totalPrice, 0)
    }
  }

  const calculateTotal = () => {
    return calculateSubtotal() + pickupFee + deliveryFee
  }

  const validateForm = () => {
    if (!orderData.serviceTypeId) return 'Pilih jenis layanan'
    if (orderData.serviceType === 'kiloan' && orderData.weight <= 0) return 'Masukkan berat cucian'
    if (orderData.serviceType === 'satuan' && orderData.items.length === 0) return 'Tambahkan minimal 1 item'
    if (orderData.serviceType === 'satuan' && orderData.items.some(item => !item.itemTypeId)) {
      return 'Lengkapi semua item'
    }
    if (!orderData.pickupAddress.trim()) return 'Masukkan alamat penjemputan'
    if (!orderData.pickupDate) return 'Pilih tanggal penjemputan'
    if (!orderData.pickupTime) return 'Pilih waktu penjemputan'
    if (!orderData.contactName.trim()) return 'Masukkan nama kontak'
    if (!orderData.contactPhone.trim()) return 'Masukkan nomor telepon'
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }    setLoading(true)

    try {
      // Generate Midtrans order ID first
      const midtransOrderId = `LAUNDRY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create order
      const orderPayload = {
        serviceType: orderData.serviceType,
        serviceTypeId: orderData.serviceTypeId,
        weight: orderData.serviceType === 'kiloan' ? orderData.weight : null,
        items: orderData.serviceType === 'satuan' ? orderData.items : [],
        pickupAddress: orderData.pickupAddress,        pickupDate: orderData.pickupDate,
        pickupTime: orderData.pickupTime,
        contactName: orderData.contactName,
        contactPhone: orderData.contactPhone,
        notes: orderData.notes,
        transactionId: midtransOrderId
      }

      const createResponse = await fetch('/api/orders/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })

      const createResult = await createResponse.json()
      
      if (!createResult.success) {
        throw new Error(createResult.message || 'Gagal membuat pesanan')
      }

      // Create payment
      const paymentPayload = {
        order_id: midtransOrderId,
        amount: calculateTotal(),
        customer_details: {
          first_name: orderData.contactName,
          email: "customer@laundry.com", // In real app, get from auth
          phone: orderData.contactPhone,
        },
        item_details: orderData.serviceType === 'kiloan' 
          ? [{
              id: "laundry-kiloan",
              name: serviceTypes.find(s => s.id === orderData.serviceTypeId)?.name || "Laundry Kiloan",
              price: calculateSubtotal(),
              quantity: 1,
            }]
          : orderData.items.map((item, index) => ({
              id: `item-${index}`,
              name: item.itemName,
              price: item.pricePerItem,
              quantity: item.quantity,
            }))
      }

      // Add pickup and delivery fees
      paymentPayload.item_details.push({
        id: "pickup-fee",
        name: "Biaya Penjemputan",
        price: pickupFee,
        quantity: 1,
      })
      
      paymentPayload.item_details.push({
        id: "delivery-fee", 
        name: "Biaya Pengantaran",
        price: deliveryFee,
        quantity: 1,
      })

      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload),
      })

      const paymentResult = await paymentResponse.json()
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Gagal membuat pembayaran')
      }      // Open Midtrans Snap
      if (window.snap) {
        window.snap.pay(paymentResult.token, {
          onSuccess: function(result: any) {
            console.log('Payment success:', result)
            // Redirect to finish page with order details
            router.push(`/payment/finish?order_id=${midtransOrderId}&transaction_status=settlement&status_code=200`)
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result)
            // Redirect to finish page with pending status
            router.push(`/payment/finish?order_id=${midtransOrderId}&transaction_status=pending&status_code=201`)
          },
          onError: function(result: any) {
            console.error('Payment error:', result)
            // Redirect to error page with error details
            router.push(`/payment/error?message=${encodeURIComponent(result.status_message || 'Terjadi kesalahan dalam pembayaran')}`)
          },
          onClose: function() {
            // Payment popup closed by user - redirect to unfinish page
            router.push('/payment/unfinish')
          }
        })
      } else {
        throw new Error('Midtrans Snap tidak tersedia')
      }

    } catch (error) {
      console.error('Error creating order:', error)
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }
  const kilogamServices = serviceTypes.filter(s => s.type === 'kiloan')
  const satuanServices = serviceTypes.filter(s => s.type === 'satuan')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">            <div className="flex items-center py-4">
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="mr-3 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Buat Pesanan Laundry</h1>
                <p className="text-sm text-gray-600">Isi form di bawah untuk membuat pesanan laundry Anda</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">{/* ...existing form content... */}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Order Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Service Type Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Pilih Jenis Layanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={orderData.serviceType}
                      onValueChange={handleServiceTypeChange}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="kiloan" id="kiloan" />
                        <Label htmlFor="kiloan" className="flex-1 cursor-pointer">
                          <div className="font-medium">Layanan Kiloan</div>
                          <div className="text-sm text-gray-600">Harga per kilogram</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="satuan" id="satuan" />
                        <Label htmlFor="satuan" className="flex-1 cursor-pointer">
                          <div className="font-medium">Layanan Satuan</div>
                          <div className="text-sm text-gray-600">Harga per item</div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Service Type Selection */}
                    {orderData.serviceType === 'kiloan' && (
                      <div className="space-y-4">
                        <Label>Pilih Paket Kiloan</Label>
                        <Select value={orderData.serviceTypeId} onValueChange={handleServiceTypeIdChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih paket kiloan..." />
                          </SelectTrigger>
                          <SelectContent>
                            {kilogamServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex justify-between items-center w-full">
                                  <span>{service.name}</span>
                                  <Badge variant="secondary">Rp {service.price.toLocaleString()}/kg</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {orderData.serviceTypeId && (
                          <div>
                            <Label htmlFor="weight">Perkiraan Berat (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={orderData.weight}
                              onChange={(e) => setOrderData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Berat akan ditimbang ulang saat penjemputan
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {orderData.serviceType === 'satuan' && (
                      <div className="space-y-4">
                        <Label>Pilih Paket Satuan</Label>
                        <Select value={orderData.serviceTypeId} onValueChange={handleServiceTypeIdChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih paket satuan..." />
                          </SelectTrigger>
                          <SelectContent>
                            {satuanServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - {service.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Items List */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label>Daftar Item</Label>
                            <Button type="button" onClick={addItem} size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Tambah Item
                            </Button>
                          </div>

                          {orderData.items.map((item, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Item #{index + 1}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label>Jenis Item</Label>
                                  <Select
                                    value={item.itemTypeId}
                                    onValueChange={(value) => updateItem(index, 'itemTypeId', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih jenis item..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {itemTypes.map((itemType) => (
                                        <SelectItem key={itemType.id} value={itemType.id}>
                                          <div className="flex justify-between items-center w-full">
                                            <span>{itemType.name}</span>
                                            <Badge variant="secondary">
                                              Rp {itemType.price.toLocaleString()}
                                            </Badge>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label>Jumlah</Label>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateItem(index, 'quantity', item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                      className="text-center w-20"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {item.totalPrice > 0 && (
                                <div className="text-right text-sm font-medium">
                                  Total: Rp {item.totalPrice.toLocaleString()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pickup Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Detail Penjemputan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Alamat Penjemputan</Label>
                      <Textarea
                        id="address"
                        placeholder="Masukkan alamat lengkap untuk penjemputan..."
                        value={orderData.pickupAddress}
                        onChange={(e) => setOrderData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pickup-date">Tanggal Penjemputan</Label>
                        <Input
                          id="pickup-date"
                          type="date"
                          value={orderData.pickupDate}
                          onChange={(e) => setOrderData(prev => ({ ...prev, pickupDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pickup-time">Waktu Penjemputan</Label>
                        <Select
                          value={orderData.pickupTime}
                          onValueChange={(value) => setOrderData(prev => ({ ...prev, pickupTime: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih waktu..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="08:00">08:00 - 10:00</SelectItem>
                            <SelectItem value="10:00">10:00 - 12:00</SelectItem>
                            <SelectItem value="13:00">13:00 - 15:00</SelectItem>
                            <SelectItem value="15:00">15:00 - 17:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Kontak Person
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact-name">Nama Kontak</Label>
                        <Input
                          id="contact-name"
                          placeholder="Nama lengkap..."
                          value={orderData.contactName}
                          onChange={(e) => setOrderData(prev => ({ ...prev, contactName: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contact-phone">Nomor Telepon</Label>
                        <Input
                          id="contact-phone"
                          placeholder="08xxxxxxxxxx"
                          value={orderData.contactPhone}
                          onChange={(e) => setOrderData(prev => ({ ...prev, contactPhone: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Instruksi khusus, lokasi detail, dll..."
                        value={orderData.notes}
                        onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Ringkasan Pesanan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Service Summary */}
                    {orderData.serviceTypeId && (
                      <div className="space-y-2">
                        <div className="font-medium">
                          {orderData.serviceType === 'kiloan' ? 'Layanan Kiloan' : 'Layanan Satuan'}
                        </div>
                        
                        {orderData.serviceType === 'kiloan' && (
                          <div className="text-sm text-gray-600">
                            {serviceTypes.find(s => s.id === orderData.serviceTypeId)?.name}
                            <br />
                            {orderData.weight} kg × Rp {serviceTypes.find(s => s.id === orderData.serviceTypeId)?.price.toLocaleString()}
                          </div>
                        )}
                        
                        {orderData.serviceType === 'satuan' && orderData.items.length > 0 && (
                          <div className="space-y-1">
                            {orderData.items.map((item, index) => (
                              item.itemName && (
                                <div key={index} className="text-sm text-gray-600">
                                  {item.itemName} × {item.quantity} = Rp {item.totalPrice.toLocaleString()}
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rp {calculateSubtotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biaya Penjemputan</span>
                        <span>Rp {pickupFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biaya Pengantaran</span>
                        <span>Rp {deliveryFee.toLocaleString()}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>Rp {calculateTotal().toLocaleString()}</span>
                    </div>

                    {/* Pickup Info */}
                    {orderData.pickupDate && orderData.pickupTime && (
                      <>
                        <Separator />
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(orderData.pickupDate).toLocaleDateString('id-ID', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{orderData.pickupTime}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <Button
                      type="submit"
                      className="text-white w-full"
                      size="lg"
                      disabled={loading || calculateTotal() === 0}
                    >
                      {loading ? 'Memproses...' : `Bayar Rp ${calculateTotal().toLocaleString()}`}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}
