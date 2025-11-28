import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AdminVehicleForm from "@/components/AdminVehicleForm";
import { Car, Plus, Mail, LogOut, Search, Filter, Trash2, Edit, Eye, CheckCircle, Clock, XCircle, LayoutDashboard, Camera, Gauge, Palette, Settings2, Tag } from "lucide-react";

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

  // Check authentication status - Railway deploys frontend/backend together, so use relative URLs
  const { data: authData, refetch: refetchAuth } = useQuery({
    queryKey: ["/api/auth/check"],
    queryFn: async () => {
      const response = await fetch('/api/auth/check', { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        return { isAuthenticated: false };
      }
      return response.json();
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // Get vehicles for admin
  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
    enabled: isAuthenticated || authData?.isAuthenticated,
    queryFn: async () => {
      const response = await fetch('/api/vehicles', { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      return response.json();
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
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
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast({ title: "Error", description: "Invalid credentials", variant: "destructive" });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      return apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Vehicle deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
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
  window.location.href = "/";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <Car className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">T-Rex Admin</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Sign in to manage your inventory</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  data-testid="input-username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  data-testid="input-password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
              <Button 
                type="submit" 
                data-testid="button-login"
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-lg shadow-emerald-500/25 transition-all duration-300"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">T-Rex Motors</h1>
                <p className="text-gray-400 text-sm">Vehicle Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/30 transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
              <Link href="/admin/submissions">
                <Button 
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Submissions
                </Button>
              </Link>
              <Link href="/">
                <Button 
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-300"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  View Site
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="ghost"
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Inventory</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Available</p>
                  <p className="text-3xl font-bold text-gray-900">{availableVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sold</p>
                  <p className="text-3xl font-bold text-gray-900">{soldVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
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
                <SelectTrigger className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
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
                className="h-11 w-full border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-white rounded-xl animate-pulse shadow-md"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVehicles.map((vehicle: Vehicle) => (
              <Card key={vehicle.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  {vehicle.statusBanner && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge 
                        className={`text-white font-medium shadow-lg px-2.5 py-1 ${
                          vehicle.statusBanner === 'new' ? 'bg-blue-500' :
                          vehicle.statusBanner === 'low-miles' ? 'bg-emerald-500' :
                          vehicle.statusBanner === 'local-trade' ? 'bg-violet-500' :
                          vehicle.statusBanner === 'just-reduced' ? 'bg-rose-500' :
                          vehicle.statusBanner === 'sold' ? 'bg-gray-500' :
                          'bg-amber-500'
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
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {vehicle.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5" />
                          {vehicle.images.length}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Car className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatPrice(vehicle.price)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Gauge className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{vehicle.mileage?.toLocaleString()} mi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Palette className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="truncate">{vehicle.exteriorColor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Tag className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="truncate">{vehicle.stockNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Settings2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="truncate">{vehicle.transmission}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600 hover:text-emerald-600 hover:border-emerald-600 transition-colors"
                        onClick={() => setEditingVehicle(vehicle)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        onClick={() => setEditingVehicle(vehicle)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredVehicles.length === 0 && !isLoading && (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No vehicles found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search filters or add a new vehicle.</p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Vehicle
              </Button>
            </CardContent>
          </Card>
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
