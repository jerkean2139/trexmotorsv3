import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import ImageLightbox from "./ImageLightbox";
import { ZoomIn } from "lucide-react";
import type { Vehicle } from "@shared/schema";

const phoneRegex = /^[\d\s\-\(\)]+$/;

const inquiryFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(phoneRegex, "Please enter a valid phone number"),
  interestType: z.string(),
  message: z.string().optional(),
});

type InquiryFormData = z.infer<typeof inquiryFormSchema>;

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length >= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length >= 3) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return digits;
};

interface VehicleDetailProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleDetail({ vehicle, onClose }: VehicleDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      interestType: 'Schedule Test Drive',
      message: '',
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: InquiryFormData) => {
      return apiRequest("POST", "/api/inquiries", {
        ...data,
        vehicleId: vehicle.id,
      });
    },
    onSuccess: () => {
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

  const onSubmit = (data: InquiryFormData) => {
    inquiryMutation.mutate(data);
  };

  const handleInterestTypeChange = (value: string) => {
    form.setValue('interestType', value);
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
              <div 
                className="relative mb-4 cursor-pointer group"
                onClick={() => setLightboxOpen(true)}
                data-testid="button-open-lightbox"
              >
                <img 
                  src={vehicle.images[selectedImage]} 
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  {selectedImage + 1} of {vehicle.images.length} photos
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-3">
                    <ZoomIn className="h-8 w-8 text-gray-800" />
                  </div>
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
                      data-testid={`thumbnail-${index}`}
                    />
                  ))}
                </div>
              )}
              
              <ImageLightbox
                images={vehicle.images}
                initialIndex={selectedImage}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              />
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
                  onClick={() => handleInterestTypeChange('Apply for Financing')}
                  data-testid="button-financing"
                >
                  <i className="fas fa-calculator mr-2 flex-shrink-0"></i>
                  <span>Apply for Financing</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-trex-green text-trex-green hover:bg-trex-green hover:text-white text-lg py-3 flex items-center justify-center"
                  onClick={() => handleInterestTypeChange('Schedule Test Drive')}
                  data-testid="button-test-drive"
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input {...field} className="focus:ring-trex-green focus:border-trex-green" data-testid="input-firstName" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input {...field} className="focus:ring-trex-green focus:border-trex-green" data-testid="input-lastName" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} className="focus:ring-trex-green focus:border-trex-green" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              {...field}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                              className="focus:ring-trex-green focus:border-trex-green" 
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interestType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="focus:ring-trex-green focus:border-trex-green" data-testid="select-interestType">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Schedule Test Drive">Schedule Test Drive</SelectItem>
                              <SelectItem value="Get More Information">Get More Information</SelectItem>
                              <SelectItem value="Check Financing Options">Check Financing Options</SelectItem>
                              <SelectItem value="Apply for Financing">Apply for Financing</SelectItem>
                              <SelectItem value="Trade-in Evaluation">Trade-in Evaluation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              {...field}
                              className="focus:ring-trex-green focus:border-trex-green"
                              placeholder="Any additional questions or comments..."
                              data-testid="input-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-trex-green hover:bg-trex-green text-white font-medium flex items-center justify-center"
                      disabled={inquiryMutation.isPending}
                      data-testid="button-submit-inquiry"
                    >
                      {inquiryMutation.isPending ? "Sending..." : "Send Inquiry"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
