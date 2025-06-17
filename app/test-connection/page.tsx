"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Database, Users, Package, Star } from "lucide-react"
import { testConnection, getServiceTypes, getItemTypes, supabase } from "@/lib/supabase"

export default function TestConnectionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [itemTypes, setItemTypes] = useState<any[]>([])
  const [authStatus, setAuthStatus] = useState<any>(null)

  const runTests = async () => {
    setIsLoading(true)
    setConnectionResult(null)
    setServiceTypes([])
    setItemTypes([])
    setAuthStatus(null)

    try {
      // Test basic connection
      console.log("Testing basic connection...")
      const connectionTest = await testConnection()
      setConnectionResult(connectionTest)

      if (connectionTest.success) {
        // Test service types
        console.log("Fetching service types...")
        try {
          const services = await getServiceTypes()
          setServiceTypes(services)
        } catch (error) {
          console.error("Service types error:", error)
        }

        // Test item types
        console.log("Fetching item types...")
        try {
          const items = await getItemTypes()
          setItemTypes(items)
        } catch (error) {
          console.error("Item types error:", error)
        }

        // Test auth status
        console.log("Checking auth status...")
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          setAuthStatus({
            hasSession: !!session,
            user: session?.user || null,
          })
        } catch (error) {
          console.error("Auth status error:", error)
        }
      }
    } catch (error) {
      console.error("Test error:", error)
      setConnectionResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Connection Test</h1>
          <p className="text-gray-600">Test your Supabase database connection and data</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connection Test
            </CardTitle>
            <CardDescription>
              Click the button below to test your Supabase connection and fetch sample data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Run Connection Tests"
              )}
            </Button>
          </CardContent>
        </Card>

        {connectionResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {connectionResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={connectionResult.success ? "default" : "destructive"}>
                {connectionResult.success ? "Connected" : "Failed"}
              </Badge>
              <p className="mt-2 text-sm text-gray-600">
                {connectionResult.success ? connectionResult.message : connectionResult.error}
              </p>
            </CardContent>
          </Card>
        )}

        {authStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={authStatus.hasSession ? "default" : "secondary"}>
                {authStatus.hasSession ? "Authenticated" : "Not Authenticated"}
              </Badge>
              {authStatus.user && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>User ID: {authStatus.user.id}</p>
                  <p>Email: {authStatus.user.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {serviceTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Service Types ({serviceTypes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceTypes.map((service) => (
                  <div key={service.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{service.name}</h4>
                      <Badge variant="outline">{service.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    <p className="text-lg font-semibold text-[#0F4C75]">Rp {service.price.toLocaleString("id-ID")}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {itemTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Item Types ({itemTypes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {itemTypes.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.category && (
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-[#0F4C75]">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Supabase URL:</strong> https://hynehzvcqpwbojjovmav.supabase.co
              </p>
              <p>
                <strong>Project ID:</strong> hynehzvcqpwbojjovmav
              </p>
              <p>
                <strong>Region:</strong> ap-southeast-1 (Singapore)
              </p>
              <p>
                <strong>Database:</strong> PostgreSQL
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
