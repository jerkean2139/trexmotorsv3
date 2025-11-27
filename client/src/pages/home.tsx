import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/SearchFilters";
import VehicleCard from "@/components/VehicleCard";
import VehicleDetail from "@/components/VehicleDetail";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@shared/schema";
import { getVehicles, getFeaturedVehicles } from "@/lib/exportedVehicles";

export default function Home() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    yearMin: "",
    yearMax: "",
    priceMin: "",
    priceMax: "",
    searchQuery: "",
    sortBy: "price-asc",
  });

  const { data: vehiclesData, isLoading } = useQuery<{vehicles: Vehicle[], totalCount: number}>({
    queryKey: ["/api/vehicles", filters],
    queryFn: async ({ queryKey }) => {
      try {
        const [url, params] = queryKey;
        const searchParams = new URLSearchParams();
        
        Object.entries(params as any).forEach(([key, value]) => {
          if (value) {
            searchParams.append(key, value as string);
          }
        });

        const response = await fetch(`${url}?${searchParams}`);
        if (!response.ok) throw new Error("Failed to fetch vehicles");
        return response.json();
      } catch (error) {
        // Fallback to embedded vehicle data if API unavailable
        console.log("API unavailable, using embedded vehicle data");
        return getVehicles(queryKey[1]);
      }
    },
  });

  const { data: featuredVehicles, isLoading: featuredLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles/featured"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/vehicles/featured");
        if (!response.ok) throw new Error("Failed to fetch featured vehicles");
        return response.json();
      } catch (error) {
        // Fallback to embedded vehicle data if API unavailable
        console.log("Featured API unavailable, using embedded vehicle data");
        return getFeaturedVehicles();
      }
    },
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Classic American muscle car - representing T-Rex Motors automotive excellence" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Quality Used Cars in <span className="text-trex-green">Richmond</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Discover your next vehicle from our extensive inventory of quality pre-owned cars, trucks, and SUVs. 
              Competitive pricing, financing available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-trex-green hover:bg-trex-green text-white px-8 py-3 text-lg font-semibold"
                onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <i className="fas fa-search mr-2"></i>Browse Inventory
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-white bg-white text-black hover:bg-white hover:text-trex-green px-8 py-3 text-lg font-semibold"
                onClick={() => window.location.href = '/financing'}
              >
                <i className="fas fa-calculator mr-2"></i>Get Financing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Filters */}
      <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Vehicle Inventory */}
      <section id="inventory" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {filters.searchQuery || Object.values(filters).some(v => v && v !== "price-asc") 
                ? "Search Results" 
                : "Featured Vehicles"
              }
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {vehiclesData?.totalCount || 0} vehicles found
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="animate-pulse">
                    <div className="bg-gray-300 h-48 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(vehiclesData?.vehicles || featuredVehicles || []).map((vehicle: Vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  onClick={handleVehicleSelect}
                />
              ))}
            </div>
          )}

          {(!isLoading && (!vehiclesData?.vehicles?.length && !featuredVehicles?.length)) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No vehicles found matching your criteria.</p>
              <Button 
                onClick={() => setFilters({
                  make: "",
                  model: "",
                  yearMin: "",
                  yearMax: "",
                  priceMin: "",
                  priceMax: "",
                  searchQuery: "",
                  sortBy: "price-asc",
                })}
                className="mt-4 bg-trex-green hover:bg-trex-green text-white"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About T-Rex Motors</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted partner for quality used cars in Richmond, IN since 2008
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-trex-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-award text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">17+ Years of Excellence</h3>
              <p className="text-gray-600">
                Serving the Richmond community with quality vehicles and exceptional customer service since 2008.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-trex-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted Service</h3>
              <p className="text-gray-600">
                Every vehicle undergoes thorough inspection and comes with our commitment to quality and reliability.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-trex-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-dollar-sign text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Competitive Pricing</h3>
              <p className="text-gray-600">
                Fair, transparent pricing with flexible financing options to help you drive away happy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit T-Rex Motors</h2>
            <p className="text-xl text-gray-600">
              Stop by our showroom or get in touch to find your perfect vehicle
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-trex-green text-xl mr-4 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">1300 South 9th St<br />Richmond, IN 47374</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <i className="fas fa-phone text-trex-green text-xl mr-4"></i>
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-600">(765) 238-2887</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <i className="fas fa-envelope text-trex-green text-xl mr-4"></i>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">info@trexmotors.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="fas fa-clock text-trex-green text-xl mr-4 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900">Hours</p>
                    <p className="text-gray-600">
                      Monday - Saturday: 9AM - 7PM<br />
                      Sunday: 12PM - 5PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <Button 
                  className="w-full bg-trex-green hover:bg-trex-green text-white py-3"
                  onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="fas fa-car mr-2"></i>Browse Our Inventory
                </Button>
                <Button 
                  className="w-full bg-white border-2 border-trex-green text-trex-green hover:bg-trex-green hover:text-white py-3"
                  onClick={() => window.location.href = '/financing'}
                >
                  <i className="fas fa-calculator mr-2"></i>Apply for Financing
                </Button>
                <Button 
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3"
                  onClick={() => window.open('tel:(765) 238-2887')}
                >
                  <i className="fas fa-phone mr-2"></i>Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetail 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
        />
      )}

      <Footer />
    </div>
  );
}
