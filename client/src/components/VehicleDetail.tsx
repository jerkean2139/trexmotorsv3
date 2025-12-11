import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Vehicle } from "@shared/schema";

interface VehicleDetailProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleDetail({ vehicle, onClose }: VehicleDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    interestType: 'Schedule Test Drive',
    message: '',
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const inquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/inquiries", {
        ...data,
        vehicleId: vehicle.id,
      });
    },
    onSuccess: () => {
      // Close the modal and redirect to thank you page
      onClose();
      setLocation('/thank-you');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send inquiry. Please try again.", variant: "destructive" });
    },
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inquiryMutation.mutate(inquiryForm);
  };

  const handleFormChange = (field: string, value: string) => {
    setInquiryForm({ ...inquiryForm, [field]: value });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.trim && ` ${vehicle.trim}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Gallery */}
          {vehicle.images && vehicle.images.length > 0 ? (
            <div>
              <div className="relative mb-4">
                <img 
                  src={vehicle.images[selectedImage]} 
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
                  {selectedImage + 1} of {vehicle.images.length} photos
                </div>
              </div>
              
              {vehicle.images.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {vehicle.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`View ${index + 1}`}
                      className={`w-full h-16 object-cover rounded cursor-pointer border-2 ${
                        selectedImage === index ? 'border-trex-green' : 'border-transparent hover:border-trex-green'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-300 rounded-lg flex items-center justify-center">
              <i className="fas fa-car text-gray-500 text-8xl"></i>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Details */}
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-trex-green mb-2">
                    {formatPrice(vehicle.price)}
                  </h3>
                  {vehicle.trim && (
                    <p className="text-gray-600">{vehicle.trim}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Stock #</p>
                  <p className="font-medium">{vehicle.stockNumber || 'N/A'}</p>
                  {vehicle.vin && (
                    <>
                      <p className="text-sm text-gray-500 mt-2">VIN</p>
                      <p className="font-mono text-xs">{vehicle.vin}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Call to Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Button 
                  className="bg-trex-green hover:bg-trex-green/90 text-white text-lg py-3 flex items-center justify-center"
                  onClick={() => handleFormChange('interestType', 'Apply for Financing')}
                >
                  <i className="fas fa-calculator mr-2 flex-shrink-0"></i>
                  <span>Apply for Financing</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-trex-green text-trex-green hover:bg-trex-green hover:text-white text-lg py-3 flex items-center justify-center"
                  onClick={() => handleFormChange('interestType', 'Schedule Test Drive')}
                >
                  <i className="fas fa-key mr-2 flex-shrink-0"></i>
                  <span>Schedule Test Drive</span>
                </Button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <i className="fas fa-tachometer-alt mr-3 text-trex-green"></i>
                    <div>
                      <p className="text-sm text-gray-500">Mileage</p>
                      <p className="font-medium">{vehicle.mileage?.toLocaleString()} miles</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-gas-pump mr-3 text-trex-green"></i>
                    <div>
                      <p className="text-sm text-gray-500">Fuel Type</p>
                      <p className="font-medium capitalize">{vehicle.fuelType}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-cogs mr-3 text-trex-green"></i>
                    <div>
                      <p className="text-sm text-gray-500">Transmission</p>
                      <p className="font-medium">{vehicle.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-palette mr-3 text-trex-green"></i>
                    <div>
                      <p className="text-sm text-gray-500">Exterior Color</p>
                      <p className="font-medium">{vehicle.exteriorColor}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-road mr-3 text-trex-green"></i>
                    <div>
                      <p className="text-sm text-gray-500">Drivetrain</p>
                      <p className="font-medium">{vehicle.drivetrain?.toUpperCase()}</p>
                    </div>
                  </div>
                  {vehicle.seatingCapacity && (
                    <div className="flex items-center">
                      <i className="fas fa-users mr-3 text-trex-green"></i>
                      <div>
                        <p className="text-sm text-gray-500">Seating</p>
                        <p className="font-medium">{vehicle.seatingCapacity} passengers</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {vehicle.description && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4">Description</h4>
                  <p className="text-gray-600">{vehicle.description}</p>
                </div>
              )}

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Key Features</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {vehicle.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <i className="fas fa-check text-trex-green mr-2"></i>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold mb-4">Interested in this vehicle?</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={inquiryForm.firstName}
                        onChange={(e) => handleFormChange('firstName', e.target.value)}
                        className="focus:ring-trex-green focus:border-trex-green"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={inquiryForm.lastName}
                        onChange={(e) => handleFormChange('lastName', e.target.value)}
                        className="focus:ring-trex-green focus:border-trex-green"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inquiryForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="focus:ring-trex-green focus:border-trex-green"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={inquiryForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="focus:ring-trex-green focus:border-trex-green"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestType">Interest Type</Label>
                    <Select value={inquiryForm.interestType} onValueChange={(value) => handleFormChange('interestType', value)}>
                      <SelectTrigger className="focus:ring-trex-green focus:border-trex-green">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Schedule Test Drive">Schedule Test Drive</SelectItem>
                        <SelectItem value="Get More Information">Get More Information</SelectItem>
                        <SelectItem value="Check Financing Options">Check Financing Options</SelectItem>
                        <SelectItem value="Apply for Financing">Apply for Financing</SelectItem>
                        <SelectItem value="Trade-in Evaluation">Trade-in Evaluation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={3}
                      value={inquiryForm.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      className="focus:ring-trex-green focus:border-trex-green"
                      placeholder="Any additional questions or comments..."
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-trex-green hover:bg-trex-green text-white font-medium flex items-center justify-center"
                    disabled={inquiryMutation.isPending}
                  >
                    {inquiryMutation.isPending ? "Sending..." : "Send Inquiry"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
