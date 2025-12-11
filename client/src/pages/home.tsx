import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/SearchFilters";
import VehicleCard from "@/components/VehicleCard";
import VehicleDetail from "@/components/VehicleDetail";
import { Button } from "@/components/ui/button";
import { Search, Calculator, Award, Handshake, DollarSign, MapPin, Phone, Mail, Clock, Car, ArrowRight } from "lucide-react";
import type { Vehicle } from "@shared/schema";
import { getVehicles, getFeaturedVehicles } from "@/lib/exportedVehicles";
import { SEOHead, LocalBusinessSchema, BreadcrumbSchema, WebVitalsMonitor } from "@/components/SEOHead";

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
      <SEOHead
        title="T-Rex Motors - Quality Used Cars in Richmond, VA"
        description="Richmond's premier used car dealership. Browse our extensive inventory of quality pre-owned cars, trucks, and SUVs. Competitive pricing and flexible financing options since 2008."
        canonical="https://trexmotors.com/"
      />
      <LocalBusinessSchema />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://trexmotors.com/" }
      ]} />
      <WebVitalsMonitor />
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Classic American muscle car - representing T-Rex Motors automotive excellence" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#72E118]/20 text-[#72E118] rounded-full border border-[#72E118]/30">
              Trusted Since 2008
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Quality Used Cars in <span className="text-[#72E118]">Richmond</span>
            </h1>
            <p className="text-lg lg:text-xl mb-8 text-gray-300 leading-relaxed">
              Discover your next vehicle from our extensive inventory of quality pre-owned cars, trucks, and SUVs. Competitive pricing with flexible financing options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-[#72E118] hover:bg-[#5CBF12] text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-[#72E118]/30 hover:shadow-[#72E118]/40 transition-all duration-300"
                onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Search className="mr-2 h-5 w-5" />
                Browse Inventory
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 px-8 py-6 text-lg font-semibold transition-all duration-300"
                onClick={() => window.location.href = '/financing'}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Get Financing
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100V50C240 16.67 480 0 720 0C960 0 1200 16.67 1440 50V100H0Z" fill="#f9fafb"/>
          </svg>
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
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-full">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About T-Rex Motors</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your trusted partner for quality used cars in Richmond, IN since 2008
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">17+ Years of Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                Serving the Richmond community with quality vehicles and exceptional customer service since 2008.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Handshake className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trusted Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Every vehicle undergoes thorough inspection and comes with our commitment to quality and reliability.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Competitive Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                Fair, transparent pricing with flexible financing options to help you drive away happy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-full">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Visit T-Rex Motors</h2>
            <p className="text-lg text-gray-600">
              Stop by our showroom or get in touch to find your perfect vehicle
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">1300 South 9th St<br />Richmond, IN 47374</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <a href="tel:7652382887" className="text-gray-600 hover:text-emerald-600 transition-colors">(765) 238-2887</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a href="mailto:info@trexmotors.com" className="text-gray-600 hover:text-emerald-600 transition-colors">info@trexmotors.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Hours</p>
                    <p className="text-gray-600">
                      Mon - Sat: 9AM - 7PM<br />
                      Sunday: 12PM - 5PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all duration-300"
                  onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Car className="mr-2 h-5 w-5" />
                  Browse Our Inventory
                  <ArrowRight className="ml-auto h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300"
                  onClick={() => window.location.href = '/financing'}
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Apply for Financing
                  <ArrowRight className="ml-auto h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300"
                  onClick={() => window.open('tel:7652382887')}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now: (765) 238-2887
                </Button>
              </div>
              
              <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm text-emerald-800 text-center">
                  <span className="font-semibold">Ready to find your next car?</span><br />
                  Visit us today for a test drive!
                </p>
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
