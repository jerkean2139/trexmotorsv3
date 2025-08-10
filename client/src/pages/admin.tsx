import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AdminVehicleForm from "@/components/AdminVehicleForm";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Vehicle } from "@shared/schema";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "admin", password: "trex2025!" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if this is a static deployment - but allow admin if explicitly enabled
  const isDevelopment = typeof window !== 'undefined' && (window.location.href.includes('localhost') || window.location.href.includes('replit.dev') || window.location.href.includes('127.0.0.1'));
  const isAdminEnabled = import.meta.env.VITE_ENABLE_ADMIN === 'true';
  const isStaticDeployment = !isDevelopment && !isAdminEnabled;
  
  // Force debug logging for Netlify troubleshooting
  console.log("🔍 Admin environment debug:", {
    isDevelopment,
    isAdminEnabled,
    isStaticDeployment,
    VITE_ENABLE_ADMIN: import.meta.env.VITE_ENABLE_ADMIN,
    windowLocation: window.location.href,
    allEnvVars: import.meta.env
  });
  
  // Additional debug info
  console.log("🌍 Current environment:", {
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE
  });

  // Check authentication status
  const { data: authData, refetch: refetchAuth } = useQuery({
    queryKey: ["/api/auth/check"],
    queryFn: async () => {
      // Skip auth check only for static deployments (production without admin enabled)
      if (isStaticDeployment) {
        return { isAuthenticated: false };
      }
      // blank comment to commit changes
      // Use backend URL directly with protection bypass header
      const baseUrl = isDevelopment ? '' : 'https://admin-backend-lyart.vercel.app';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      // Add protection bypass header for production
      if (!isDevelopment) {
        headers['x-vercel-protection-bypass'] = import.meta.env.VITE_VERCEL_BYPASS_TOKEN || '';
      }
      
      const response = await fetch(`${baseUrl}/api/auth/check`, { 
        credentials: 'include',
        headers 
      });
      if (!response.ok) {
        return { isAuthenticated: false };
      }
      const result = await response.json();
      console.log("Auth check result:", result);
      return result;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // Get vehicles for admin
  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ["/api/auth/vehicles"],
    enabled: isAuthenticated || authData?.isAuthenticated,
    queryFn: async () => {
      const baseUrl = isDevelopment ? '' : 'https://admin-backend-lyart.vercel.app';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (!isDevelopment) {
        headers['x-vercel-protection-bypass'] = import.meta.env.VITE_VERCEL_BYPASS_TOKEN || '';
      }
      const response = await fetch(`${baseUrl}/api/auth/vehicles`, { headers });
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      return response.json();
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      // Skip login for static deployments (production without admin enabled)
      if (isStaticDeployment) {
        throw new Error('Admin login not available in static deployment');
      }
      
      // Use backend URL directly with protection bypass header
      const baseUrl = isDevelopment ? '' : 'https://admin-backend-lyart.vercel.app';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      // Add protection bypass header for production
      if (!isDevelopment) {
        headers['x-vercel-protection-bypass'] = import.meta.env.VITE_VERCEL_BYPASS_TOKEN || '';
      }
      
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers,
        credentials: 'include',
        body: JSON.stringify(credentials)
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      console.log("Login success:", data);
      setIsAuthenticated(true);
      toast({ title: "Success", description: "Logged in successfully" });
      await refetchAuth();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/vehicles"] });
    },
    onError: (error) => {
      console.error("Login error:", error);
      const errorMessage = isStaticDeployment 
        ? "Admin login is only available in development environment"
        : "Invalid credentials";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const baseUrl = isDevelopment ? '' : 'https://admin-backend-lyart.vercel.app';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      // Add protection bypass header for production
      if (!isDevelopment) {
        headers['x-vercel-protection-bypass'] = import.meta.env.VITE_VERCEL_BYPASS_TOKEN || '';
      }
      
      return fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include'
      });
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      toast({ title: "Success", description: "Logged out successfully" });
      queryClient.clear();
    },
  });

  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `https://admin-backend-lyart.vercel.app/api/auth/vehicles/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Vehicle deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/vehicles"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete vehicle", variant: "destructive" });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicleMutation.mutate(id);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  // Filter vehicles based on search and filters
  const vehicles = (vehiclesData as { vehicles?: Vehicle[] })?.vehicles || [];
  console.log("vehicles:", vehicles);
  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    const matchesSearch = searchQuery === "" || 
      `${vehicle.make} ${vehicle.model} ${vehicle.vin} ${vehicle.stockNumber}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    const matchesYear = yearFilter === "all" || vehicle.year.toString() === yearFilter;
    
    return matchesSearch && matchesStatus && matchesYear;
  });

  // Calculate statistics
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v: Vehicle) => v.status === 'available').length;
  const soldVehicles = vehicles.filter((v: Vehicle) => v.status === 'sold').length;
  const pendingVehicles = vehicles.filter((v: Vehicle) => v.status === 'pending').length;

  // Show login form if not authenticated
  if (!isAuthenticated && !authData?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <i className="fas fa-car text-trex-green mr-2"></i>
              T-Rex Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isStaticDeployment && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Notice:</strong> Admin functionality is only available in the development environment. 
                  This static deployment provides read-only access to the vehicle inventory.
                </p>
              </div>
            )}
            {!isDevelopment && isAdminEnabled && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Production Admin Mode:</strong> Admin functionality enabled for production environment.
                </p>
              </div>
            )}
            
            {/* Debug info for troubleshooting */}
            {!isDevelopment && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
                <p><strong>Debug:</strong> VITE_ENABLE_ADMIN = {import.meta.env.VITE_ENABLE_ADMIN}</p>
                <p>isAdminEnabled = {isAdminEnabled ? 'true' : 'false'}</p>
                <p>isStaticDeployment = {isStaticDeployment ? 'true' : 'false'}</p>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                  disabled={isStaticDeployment}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  disabled={isStaticDeployment}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-trex-green hover:bg-trex-green text-white"
                disabled={loginMutation.isPending || isStaticDeployment}
              >
                {loginMutation.isPending ? "Logging in..." : isStaticDeployment ? "Admin Not Available" : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Green Header Bar */}
      <div className="bg-[#4CAF50] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-car text-[#4CAF50] text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">T-Rex Motors Admin</h1>
              <p className="text-green-100 text-sm">Enhanced Vehicle Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-white text-[#4CAF50] hover:bg-gray-100 font-medium"
              >
                + Add New Vehicle
              </Button>
              <Link href="/admin/submissions">
                <Button 
                  className="bg-green-600 text-white hover:bg-green-700 font-medium"
                >
                  <i className="fas fa-envelope mr-2"></i>
                  View Submissions
                </Button>
              </Link>

            </div>
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-green-600"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-l-4 border-l-[#4CAF50]">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#4CAF50] rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-car text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Vehicles</p>
                  <p className="text-2xl font-bold text-[#4CAF50]">{totalVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-[#4CAF50]">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#4CAF50] rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-car text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">For Sale</p>
                  <p className="text-2xl font-bold text-[#4CAF50]">{availableVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-check text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sold</p>
                  <p className="text-2xl font-bold text-red-500">{soldVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-clock text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Search & Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by make, model, VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {Array.from(new Set(vehicles.map((v: Vehicle) => v.year.toString())))
                  .sort((a: string, b: string) => parseInt(b) - parseInt(a))
                  .map((year: string) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setYearFilter("all");
              }}
              className="w-full"
            >
              × Clear Filters
            </Button>
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle: Vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {vehicle.statusBanner && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge 
                        variant="secondary" 
                        className={`text-white font-semibold ${
                          vehicle.statusBanner === 'new' ? 'bg-blue-500' :
                          vehicle.statusBanner === 'low-miles' ? 'bg-green-500' :
                          vehicle.statusBanner === 'local-trade' ? 'bg-purple-500' :
                          vehicle.statusBanner === 'just-reduced' ? 'bg-red-500' :
                          vehicle.statusBanner === 'sold' ? 'bg-gray-500' :
                          'bg-yellow-500'
                        }`}
                      >
                        {vehicle.statusBanner === 'new' ? 'NEW' :
                         vehicle.statusBanner === 'low-miles' ? 'LOW MILES' :
                         vehicle.statusBanner === 'local-trade' ? 'LOCAL TRADE' :
                         vehicle.statusBanner === 'just-reduced' ? 'JUST REDUCED' :
                         vehicle.statusBanner === 'sold' ? 'SOLD' :
                         'PENDING'}
                      </Badge>
                    </div>
                  )}
                  
                  {vehicle.images?.[0] ? (
                    <div className="relative">
                      <img 
                        src={vehicle.images[0]} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-48 object-cover"
                      />
                      {vehicle.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                          📷 {vehicle.images.length} photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-car text-gray-400 text-4xl"></i>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#4CAF50]">
                        {formatPrice(vehicle.price)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>🛣️ {vehicle.mileage?.toLocaleString()} miles</span>
                      <span>🎨 {vehicle.exteriorColor}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>📋 {vehicle.stockNumber}</span>
                      <span>🔧 {vehicle.transmission}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => setEditingVehicle(vehicle)}
                      >
                        👁️ View
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#4CAF50] hover:bg-green-600 text-white"
                        onClick={() => setEditingVehicle(vehicle)}
                      >
                        ✏️ Edit
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredVehicles.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <i className="fas fa-car text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No vehicles found</h3>
            <p className="text-gray-500">Try adjusting your search filters or add a new vehicle.</p>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <AdminVehicleForm 
            onSuccess={() => setShowAddModal(false)}
            onCancel={() => setShowAddModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Modal */}
      <Dialog open={!!editingVehicle} onOpenChange={() => setEditingVehicle(null)}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <AdminVehicleForm 
            vehicle={editingVehicle}
            onSuccess={() => setEditingVehicle(null)}
            onCancel={() => setEditingVehicle(null)}
          />
        </DialogContent>
      </Dialog>


    </div>
  );
}
