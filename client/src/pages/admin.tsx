import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminVehicleForm from "@/components/AdminVehicleForm";
import { Car, Plus, Mail, LogOut, Search, Filter, Trash2, Edit, Eye, CheckCircle, Clock, XCircle, LayoutDashboard, Camera, Gauge, Palette, Settings2, Tag, LayoutGrid, TableIcon, Star, DollarSign, Building2, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Vehicle, Dealership } from "@shared/schema";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedDealershipId, setSelectedDealershipId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminSelectedDealership') || "";
    }
    return "";
  });
  const [viewMode, setViewMode] = useState<"tiles" | "table">(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('adminViewMode') as "tiles" | "table") || "tiles";
    }
    return "tiles";
  });
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('adminViewMode', viewMode);
  }, [viewMode]);

  // Persist selected dealership preference
  useEffect(() => {
    localStorage.setItem('adminSelectedDealership', selectedDealershipId);
  }, [selectedDealershipId]);

  // Fetch dealerships
  const { data: dealerships = [] } = useQuery<Dealership[]>({
    queryKey: ["/api/dealerships"],
    queryFn: async () => {
      const response = await fetch('/api/dealerships', { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch dealerships');
      return response.json();
    },
  });

  // Auto-select first dealership if none selected
  useEffect(() => {
    if (dealerships.length > 0 && !selectedDealershipId) {
      setSelectedDealershipId(dealerships[0].id);
    }
  }, [dealerships, selectedDealershipId]);

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

  // Get vehicles for admin (filtered by dealership)
  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ["/api/vehicles", selectedDealershipId],
    enabled: (isAuthenticated || authData?.isAuthenticated) && !!selectedDealershipId,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDealershipId) {
        params.set('dealershipId', selectedDealershipId);
      }
      const response = await fetch(`/api/vehicles?${params.toString()}`, { 
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
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", selectedDealershipId] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", selectedDealershipId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete vehicle", variant: "destructive" });
    },
  });

  // Quick inline update mutation
  const inlineUpdateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Vehicle> }) => {
      return apiRequest("PUT", `/api/vehicles/${id}`, updates);
    },
    onSuccess: (_, variables) => {
      const fieldName = Object.keys(variables.updates)[0];
      toast({ title: "Updated", description: `${fieldName} updated successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", selectedDealershipId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update vehicle", variant: "destructive" });
    },
  });

  // Handle inline status change
  const handleStatusChange = (vehicleId: string, newStatus: string) => {
    inlineUpdateMutation.mutate({ id: vehicleId, updates: { status: newStatus } });
  };

  // Handle inline price change
  const handlePriceUpdate = (vehicleId: string) => {
    if (editingPrice && editingPrice.id === vehicleId) {
      const numericPrice = editingPrice.value.replace(/[^0-9.]/g, '');
      if (numericPrice) {
        inlineUpdateMutation.mutate({ id: vehicleId, updates: { price: numericPrice } });
      }
      setEditingPrice(null);
    }
  };

  // Handle inline featured toggle
  const handleFeaturedToggle = (vehicleId: string, currentValue: boolean | null) => {
    inlineUpdateMutation.mutate({ id: vehicleId, updates: { isFeatured: !currentValue } });
  };

  // Handle inline status banner change
  const handleStatusBannerChange = (vehicleId: string, newBanner: string | null) => {
    inlineUpdateMutation.mutate({ id: vehicleId, updates: { statusBanner: newBanner } });
  };

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Vehicle> }) => {
      const results = await Promise.all(
        ids.map(id => apiRequest("PUT", `/api/vehicles/${id}`, updates))
      );
      return results;
    },
    onSuccess: (_, { ids, updates }) => {
      const fieldName = Object.keys(updates)[0];
      toast({ title: "Bulk Update Complete", description: `Updated ${ids.length} vehicles (${fieldName})` });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", selectedDealershipId] });
      setSelectedVehicleIds(new Set());
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update some vehicles", variant: "destructive" });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.all(
        ids.map(id => apiRequest("DELETE", `/api/vehicles/${id}`))
      );
      return results;
    },
    onSuccess: (_, ids) => {
      toast({ title: "Deleted", description: `Deleted ${ids.length} vehicles` });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", selectedDealershipId] });
      setSelectedVehicleIds(new Set());
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete some vehicles", variant: "destructive" });
    },
  });

  // Toggle vehicle selection
  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      const next = new Set(prev);
      if (next.has(vehicleId)) {
        next.delete(vehicleId);
      } else {
        next.add(vehicleId);
      }
      return next;
    });
  };

  // Select all filtered vehicles
  const selectAllVehicles = () => {
    if (selectedVehicleIds.size === filteredVehicles.length) {
      setSelectedVehicleIds(new Set());
    } else {
      setSelectedVehicleIds(new Set(filteredVehicles.map((v: Vehicle) => v.id)));
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = (status: string) => {
    const ids = Array.from(selectedVehicleIds);
    if (ids.length > 0) {
      bulkUpdateMutation.mutate({ ids, updates: { status } });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    const ids = Array.from(selectedVehicleIds);
    if (ids.length > 0 && confirm(`Are you sure you want to delete ${ids.length} vehicles? This cannot be undone.`)) {
      bulkDeleteMutation.mutate(ids);
    }
  };

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
            <img 
              src="https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png" 
              alt="T-Rex Motors Logo" 
              className="h-20 w-auto mx-auto mb-4"
            />
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Enter your login details to manage vehicles</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  data-testid="input-username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="h-11 border-gray-200 focus:border-[#72E118] focus:ring-[#72E118]"
                  required
                />
                <p className="text-xs text-gray-400">Use the username provided by your administrator</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  data-testid="input-password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="h-11 border-gray-200 focus:border-[#72E118] focus:ring-[#72E118]"
                  required
                />
                <p className="text-xs text-gray-400">Contact your administrator if you forgot your password</p>
              </div>
              <Button 
                type="submit" 
                data-testid="button-login"
                className="w-full h-12 bg-[#72E118] hover:bg-[#5CBF12] text-black font-semibold text-lg shadow-lg transition-all duration-300"
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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gradient-to-br from-[#72E118] to-[#5CBF12] rounded-xl flex items-center justify-center shadow-lg shadow-[#72E118]/30">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">T-Rex Motors</h1>
                  <p className="text-gray-400 text-sm">Vehicle Management Dashboard</p>
                </div>
              </div>
              
              {/* Dealership Selector */}
              <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-600">
                <Building2 className="h-5 w-5 text-[#72E118]" />
                <Select 
                  value={selectedDealershipId} 
                  onValueChange={setSelectedDealershipId}
                >
                  <SelectTrigger 
                    className="border-0 bg-transparent text-white w-48 focus:ring-0 focus:ring-offset-0"
                    data-testid="select-dealership"
                  >
                    <SelectValue placeholder="Select dealership" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealerships.map((dealership) => (
                      <SelectItem 
                        key={dealership.id} 
                        value={dealership.id}
                        data-testid={`option-dealership-${dealership.id}`}
                      >
                        {dealership.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#72E118] hover:bg-[#5CBF12] text-gray-900 font-medium shadow-lg shadow-[#72E118]/30 transition-all duration-300"
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
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
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
                <div className="w-12 h-12 bg-gradient-to-br from-[#72E118] to-[#5CBF12] rounded-xl flex items-center justify-center shadow-lg shadow-[#72E118]/30">
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-[#72E118] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === "tiles" ? "default" : "ghost"}
                  onClick={() => setViewMode("tiles")}
                  className={`h-8 px-3 ${viewMode === "tiles" ? "bg-[#72E118] hover:bg-[#5CBF12] text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                  data-testid="button-view-tiles"
                >
                  <LayoutGrid className="h-4 w-4 mr-1.5" />
                  Tiles
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  onClick={() => setViewMode("table")}
                  className={`h-8 px-3 ${viewMode === "table" ? "bg-[#72E118] hover:bg-[#5CBF12] text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                  data-testid="button-view-table"
                >
                  <TableIcon className="h-4 w-4 mr-1.5" />
                  Table
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-[#72E118] focus:ring-[#72E118]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 border-gray-200 focus:border-[#72E118] focus:ring-[#72E118]">
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
                <SelectTrigger className="h-11 border-gray-200 focus:border-[#72E118] focus:ring-[#72E118]">
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

        {/* Bulk Actions Bar */}
        {selectedVehicleIds.size > 0 && (
          <Card className="border-0 shadow-md bg-[#72E118]/10 mb-4">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-[#72E118]" />
                  <span className="font-medium text-gray-900">
                    {selectedVehicleIds.size} vehicle{selectedVehicleIds.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Select onValueChange={handleBulkStatusChange}>
                    <SelectTrigger className="h-9 w-[140px] text-sm border-gray-200" data-testid="bulk-status-select">
                      <SelectValue placeholder="Set Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Set Available</SelectItem>
                      <SelectItem value="pending">Set Pending</SelectItem>
                      <SelectItem value="sold">Set Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-9 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    disabled={bulkDeleteMutation.isPending}
                    data-testid="button-bulk-delete"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedVehicleIds(new Set())}
                    className="h-9 text-gray-600"
                    data-testid="button-clear-selection"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Display - Tiles or Table */}
        {isLoading ? (
          viewMode === "tiles" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-white rounded-xl animate-pulse shadow-md"></div>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <div className="p-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded w-full mb-2"></div>
                ))}
              </div>
            </Card>
          )
        ) : viewMode === "table" ? (
          /* Table View */
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 w-[40px]">
                      <Checkbox 
                        checked={selectedVehicleIds.size === filteredVehicles.length && filteredVehicles.length > 0}
                        onCheckedChange={selectAllVehicles}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[50px]">Image</TableHead>
                    <TableHead className="font-semibold text-gray-700">Vehicle</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[130px]">Price</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[100px]">Mileage</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[120px]">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[130px]">Banner</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[80px] text-center">Featured</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[140px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle: Vehicle) => (
                    <TableRow key={vehicle.id} className={`hover:bg-gray-50 ${selectedVehicleIds.has(vehicle.id) ? 'bg-[#72E118]/5' : ''}`} data-testid={`table-row-${vehicle.id}`}>
                      <TableCell className="py-2">
                        <Checkbox 
                          checked={selectedVehicleIds.has(vehicle.id)}
                          onCheckedChange={() => toggleVehicleSelection(vehicle.id)}
                          data-testid={`checkbox-${vehicle.id}`}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        {vehicle.images?.[0] ? (
                          <img 
                            src={vehicle.images[0]} 
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-12 h-10 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                            <Car className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-xs text-gray-500">Stock: {vehicle.stockNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingPrice?.id === vehicle.id ? (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              value={editingPrice.value}
                              onChange={(e) => setEditingPrice({ id: vehicle.id, value: e.target.value })}
                              onBlur={() => handlePriceUpdate(vehicle.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handlePriceUpdate(vehicle.id)}
                              className="h-8 w-24 text-sm"
                              autoFocus
                              data-testid={`input-price-${vehicle.id}`}
                            />
                          </div>
                        ) : (
                          <button 
                            onClick={() => setEditingPrice({ id: vehicle.id, value: vehicle.price })}
                            className="font-semibold text-[#72E118] hover:text-[#5CBF12] hover:underline cursor-pointer"
                            data-testid={`button-edit-price-${vehicle.id}`}
                          >
                            {formatPrice(vehicle.price)}
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {vehicle.mileage?.toLocaleString()} mi
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={vehicle.status} 
                          onValueChange={(value) => handleStatusChange(vehicle.id, value)}
                        >
                          <SelectTrigger 
                            className={`h-8 w-[110px] text-xs font-medium border-0 ${
                              vehicle.status === 'available' ? 'bg-[#72E118]/20 text-[#5CBF12]' :
                              vehicle.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                            data-testid={`select-status-${vehicle.id}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={vehicle.statusBanner || "none"} 
                          onValueChange={(value) => handleStatusBannerChange(vehicle.id, value === "none" ? null : value)}
                        >
                          <SelectTrigger 
                            className="h-8 w-[120px] text-xs border-gray-200"
                            data-testid={`select-banner-${vehicle.id}`}
                          >
                            <SelectValue placeholder="No banner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Banner</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="low-miles">Low Miles</SelectItem>
                            <SelectItem value="local-trade">Local Trade</SelectItem>
                            <SelectItem value="just-reduced">Just Reduced</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={vehicle.isFeatured || false}
                          onCheckedChange={() => handleFeaturedToggle(vehicle.id, vehicle.isFeatured)}
                          className="data-[state=checked]:bg-[#72E118]"
                          data-testid={`switch-featured-${vehicle.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-[#72E118]"
                            onClick={() => setEditingVehicle(vehicle)}
                            data-testid={`button-edit-${vehicle.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            data-testid={`button-delete-${vehicle.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          /* Tiles View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVehicles.map((vehicle: Vehicle) => (
              <Card key={vehicle.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  {vehicle.statusBanner && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge 
                        className={`text-white font-medium shadow-lg px-2.5 py-1 ${
                          vehicle.statusBanner === 'new' ? 'bg-blue-500' :
                          vehicle.statusBanner === 'low-miles' ? 'bg-[#72E118]' :
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
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#72E118] transition-colors line-clamp-1">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <span className="text-lg font-bold text-[#72E118]">
                      {formatPrice(vehicle.price)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Gauge className="h-3.5 w-3.5 text-[#72E118]" />
                      <span>{vehicle.mileage?.toLocaleString()} mi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Palette className="h-3.5 w-3.5 text-[#72E118]" />
                      <span className="truncate">{vehicle.exteriorColor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Tag className="h-3.5 w-3.5 text-[#72E118]" />
                      <span className="truncate">{vehicle.stockNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Settings2 className="h-3.5 w-3.5 text-[#72E118]" />
                      <span className="truncate">{vehicle.transmission}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600 hover:text-[#72E118] hover:border-[#72E118] transition-colors"
                        onClick={() => setEditingVehicle(vehicle)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#72E118] hover:bg-[#5CBF12] text-gray-900 transition-colors"
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
                className="bg-[#72E118] hover:bg-[#5CBF12] text-gray-900"
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
            dealershipId={selectedDealershipId}
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
            dealershipId={selectedDealershipId}
            onSuccess={() => setEditingVehicle(null)}
            onCancel={() => setEditingVehicle(null)}
          />
        </DialogContent>
      </Dialog>


    </div>
  );
}
