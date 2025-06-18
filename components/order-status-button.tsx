"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export function OrderStatusButton() {
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkActiveOrders = async () => {
      try {
        // Get the current user
        const { data: userData } = await supabase.auth.getSession();
        
        if (userData?.session?.user) {
          // Get all orders for the user
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', userData.session.user.id);
          
          if (!ordersError && ordersData && ordersData.length > 0) {
            // Get a count of active orders by checking tracking status
            let activeCount = 0;
            
            for (const order of ordersData) {
              // Get the latest status from order_tracking
              const { data: trackingData } = await supabase
                .from('order_tracking')
                .select('status')
                .eq('order_id', order.id)
                .order('created_at', { ascending: false })
                .limit(1);
              
              if (trackingData && trackingData.length > 0) {
                const status = trackingData[0].status.toLowerCase();
                if (![
                  'completed', 'delivered', 'selesai', 'cancelled', 'dibatalkan'
                ].includes(status)) {
                  activeCount++;
                }
              }
            }
            
            setActiveOrdersCount(activeCount);
          }
        }
      } catch (error) {
        console.error('Error checking active orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkActiveOrders();
    
    // Set up a timer to check every 5 minutes
    const timer = setInterval(checkActiveOrders, 300000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <Link href="/orders" className="relative">
      <Button variant="outline" size="sm" className="gap-2">
        <Clock className="w-4 h-4" />
        Status Order
        {activeOrdersCount > 0 && (
          <Badge variant="default" className="bg-red-500 text-white h-5 min-w-5 flex items-center justify-center rounded-full text-xs">
            {activeOrdersCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
