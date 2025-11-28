import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Fuel, Settings2, Palette, Car, ArrowRight } from "lucide-react";
import type { Vehicle } from "@shared/schema";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'new':
        return 'bg-emerald-500 text-white';
      case 'low-miles':
        return 'bg-blue-500 text-white';
      case 'local-trade':
        return 'bg-violet-500 text-white';
      case 'just-reduced':
        return 'bg-rose-500 text-white';
      case 'sold':
        return 'bg-gray-500 text-white';
      case 'pending':
        return 'bg-amber-500 text-white';
      case 'featured':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case 'new':
        return 'New';
      case 'low-miles':
        return 'Low Miles';
      case 'local-trade':
        return 'Local Trade In';
      case 'just-reduced':
        return 'Just Reduced';
      case 'sold':
        return 'Sold';
      case 'pending':
        return 'Pending';
      default:
        return type;
    }
  };

  const getBadgeForVehicle = (vehicle: Vehicle) => {
    if (vehicle.statusBanner) {
      return { text: getBadgeText(vehicle.statusBanner), type: vehicle.statusBanner };
    }
    if (vehicle.isFeatured) {
      return { text: 'Featured', type: 'featured' };
    }
    return null;
  };

  const badge = getBadgeForVehicle(vehicle);

  return (
    <Card 
      className="group overflow-hidden bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
      onClick={() => onClick(vehicle)}
      data-testid={`card-vehicle-${vehicle.id}`}
    >
      <div className="relative overflow-hidden">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img 
            src={vehicle.images[0]} 
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Car className="h-16 w-16 text-gray-300" />
          </div>
        )}
        {badge && (
          <Badge className={`absolute top-3 right-3 ${getBadgeVariant(badge.type)} shadow-lg px-3 py-1 text-xs font-medium`}>
            {badge.text}
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.trim && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{vehicle.trim}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <Gauge className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{vehicle.mileage?.toLocaleString()} mi</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <Fuel className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="capitalize truncate">{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <Settings2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <Palette className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{vehicle.exteriorColor}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-2xl font-bold text-emerald-600">
            {formatPrice(vehicle.price)}
          </span>
          <Button 
            className="bg-gray-900 hover:bg-emerald-600 text-white transition-all duration-300 group/btn"
            onClick={(e) => {
              e.stopPropagation();
              onClick(vehicle);
            }}
            data-testid={`button-view-${vehicle.id}`}
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
