"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderCreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main order page
    router.replace("/order");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">Redirecting...</h2>
        <p className="text-gray-500">Please wait while we redirect you to the order page.</p>
      </div>
    </div>
  );
}
