import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";

interface FinancingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  employmentStatus: string;
  monthlyIncome: string;
  creditScore: string;
  downPayment: string;
  vehicleInterest: string;
  additionalInfo: string;
}

function FinancingPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FinancingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    employmentStatus: "",
    monthlyIncome: "",
    creditScore: "",
    downPayment: "",
    vehicleInterest: "",
    additionalInfo: "",
  });

  const handleInputChange = (field: keyof FinancingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/financing-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }
      
      // Redirect to thank you page on success
      setLocation('/thank-you');
    } catch (error) {
      console.error('Error submitting financing application:', error);
      toast({
        title: "Submission Failed", 
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Auto Financing | Get Pre-Approved Today | T-Rex Motors Richmond"
        description="Apply for auto financing at T-Rex Motors in Richmond, VA. Easy pre-approval process, competitive rates, and flexible terms for all credit types. Get started today!"
        canonical="https://trexmotors.com/financing"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://trexmotors.com/" },
        { name: "Financing", url: "https://trexmotors.com/financing" }
      ]} />
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[250px]">
            <Link href="/">
              <img 
                src="https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png" 
                alt="T-Rex Motors Logo" 
                className="w-[250px] h-[250px] object-contain cursor-pointer"
              />
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Inventory</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-trex-green text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Get Pre-Approved for Financing</h1>
          <p className="text-xl mb-6">
            Quick and easy auto loan application. Get approved in minutes with competitive rates.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">2.9%</div>
              <div className="text-sm opacity-90">Starting APR*</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24hrs</div>
              <div className="text-sm opacity-90">Quick Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-90">Secure Process</div>
            </div>
          </div>
        </div>
      </section>

      {/* Financing Form */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financing Application</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employmentStatus">Employment Status *</Label>
                    <Select value={formData.employmentStatus} onValueChange={(value) => handleInputChange('employmentStatus', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed Full-Time</SelectItem>
                        <SelectItem value="part-time">Employed Part-Time</SelectItem>
                        <SelectItem value="self-employed">Self-Employed</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="monthlyIncome">Monthly Income *</Label>
                    <Select value={formData.monthlyIncome} onValueChange={(value) => handleInputChange('monthlyIncome', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-2000">Under $2,000</SelectItem>
                        <SelectItem value="2000-4000">$2,000 - $4,000</SelectItem>
                        <SelectItem value="4000-6000">$4,000 - $6,000</SelectItem>
                        <SelectItem value="6000-8000">$6,000 - $8,000</SelectItem>
                        <SelectItem value="over-8000">Over $8,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="creditScore">Credit Score Range</Label>
                    <Select value={formData.creditScore} onValueChange={(value) => handleInputChange('creditScore', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit range (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent (750+)</SelectItem>
                        <SelectItem value="good">Good (700-749)</SelectItem>
                        <SelectItem value="fair">Fair (650-699)</SelectItem>
                        <SelectItem value="poor">Poor (600-649)</SelectItem>
                        <SelectItem value="bad">Bad (below 600)</SelectItem>
                        <SelectItem value="unknown">I don't know</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="downPayment">Down Payment Amount</Label>
                    <Select value={formData.downPayment} onValueChange={(value) => handleInputChange('downPayment', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select down payment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">$0 (No down payment)</SelectItem>
                        <SelectItem value="1000">$1,000</SelectItem>
                        <SelectItem value="2500">$2,500</SelectItem>
                        <SelectItem value="5000">$5,000</SelectItem>
                        <SelectItem value="10000">$10,000</SelectItem>
                        <SelectItem value="15000">$15,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Vehicle Interest */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                <div>
                  <Label htmlFor="vehicleInterest">Specific Vehicle of Interest</Label>
                  <Input
                    id="vehicleInterest"
                    placeholder="e.g. 2018 Honda Civic, Any SUV under $25K"
                    value={formData.vehicleInterest}
                    onChange={(e) => handleInputChange('vehicleInterest', e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Any additional information you'd like us to know about your financing needs..."
                  rows={4}
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-trex-green hover:bg-trex-green text-white px-12 py-3 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                * Required fields. Your information is secure and will only be used for financing purposes.
                By submitting this form, you consent to T-Rex Motors contacting you about your application.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FinancingPage;