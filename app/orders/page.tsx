"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle, Truck, History, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  status: string;
  created_at: string;
  total_price: number;
  service_type: string;
  weight?: number;
  items?: any[];
  pickup_date: string;
  pickup_time: string;
  pickup_address: string;
  contact_name: string;
  contact_phone: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        fetchOrders(data.session.user.id);
        
        // Check if there's a tab query parameter
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'history') {
          setActiveTab('history');
        }
      } else {
        router.push("/auth/signin");
      }
    };
    
    checkUser();
  }, [router]);

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'menunggu pembayaran':
        return 'bg-yellow-500';
      case 'processing':
      case 'sedang diproses':
        return 'bg-blue-500';
      case 'pickup':
      case 'menunggu pickup':
        return 'bg-purple-500';
      case 'delivery':
      case 'dalam pengiriman':
        return 'bg-indigo-500';
      case 'completed':
      case 'selesai':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'menunggu pembayaran':
        return <Clock className="w-4 h-4" />;
      case 'processing':
      case 'sedang diproses':
        return <Package className="w-4 h-4" />;
      case 'pickup':
      case 'menunggu pickup':
        return <Clock className="w-4 h-4" />;
      case 'delivery':
      case 'dalam pengiriman':
        return <Truck className="w-4 h-4" />;
      case 'completed':
      case 'selesai':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const activeOrders = orders.filter(order => 
    ['pending', 'menunggu pembayaran', 'processing', 'sedang diproses', 'pickup', 'menunggu pickup', 'delivery', 'dalam pengiriman'].includes(order.status.toLowerCase())
  );
  
  const completedOrders = orders.filter(order => 
    ['completed', 'selesai'].includes(order.status.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pesanan Saya</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="active" className="text-sm">
              Status Order ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              Riwayat ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : activeOrders.length > 0 ? (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <Link href={`/order-status/${order.id}`} key={order.id}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 ${getStatusColor(order.status)} rounded-lg flex items-center justify-center text-white`}
                            >
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Order #{order.id.substring(0, 8)}</h4>
                              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{order.status}</Badge>
                        </div>
                        <div className="flex justify-between mt-4">
                          <div className="text-sm text-gray-600">
                            <p>{order.service_type} {order.weight ? `(${order.weight} kg)` : ''}</p>
                            <p>Pickup: {order.pickup_date} {order.pickup_time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              Rp {order.total_price?.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pesanan aktif</h3>
                  <p className="text-gray-600 mb-6">Buat pesanan laundry baru sekarang</p>
                  <Link href="/order">
                    <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">
                      Buat Order Baru
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : completedOrders.length > 0 ? (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <Link href={`/order-status/${order.id}`} key={order.id}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Order #{order.id.substring(0, 8)}</h4>
                              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between mt-4">
                          <div className="text-sm text-gray-600">
                            <p>{order.service_type} {order.weight ? `(${order.weight} kg)` : ''}</p>
                            <p>Selesai: {formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              Rp {order.total_price?.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada riwayat pesanan</h3>
                  <p className="text-gray-600 mb-6">Riwayat pesanan yang telah selesai akan muncul di sini</p>
                  <Link href="/order">
                    <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">
                      Buat Order Baru
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
