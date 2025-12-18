import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";

const phoneRegex = /^[\d\s\-\(\)]+$/;

const financingFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(phoneRegex, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter a valid street address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please enter a valid state"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters").max(10, "ZIP code is too long"),
  employmentStatus: z.string().min(1, "Please select your employment status"),
  monthlyIncome: z.string().min(1, "Please select your income range"),
  creditScore: z.string().optional(),
  downPayment: z.string().optional(),
  vehicleInterest: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type FinancingFormData = z.infer<typeof financingFormSchema>;

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length >= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length >= 3) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return digits;
};

function FinancingPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<FinancingFormData>({
    resolver: zodResolver(financingFormSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = async (data: FinancingFormData) => {
    try {
      const response = await fetch('/api/financing-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }
      
      setLocation('/thank-you');
    } catch (error: any) {
      console.error('Error submitting financing application:', error);
      toast({
        title: "Submission Failed", 
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
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

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financing Application</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-firstName" />
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
                            <Input {...field} data-testid="input-lastName" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-email" />
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
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              {...field}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-zipCode" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employmentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-employmentStatus">
                                <SelectValue placeholder="Select employment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="employed">Employed Full-Time</SelectItem>
                              <SelectItem value="part-time">Employed Part-Time</SelectItem>
                              <SelectItem value="self-employed">Self-Employed</SelectItem>
                              <SelectItem value="retired">Retired</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="unemployed">Unemployed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-monthlyIncome">
                                <SelectValue placeholder="Select income range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under-2000">Under $2,000</SelectItem>
                              <SelectItem value="2000-4000">$2,000 - $4,000</SelectItem>
                              <SelectItem value="4000-6000">$4,000 - $6,000</SelectItem>
                              <SelectItem value="6000-8000">$6,000 - $8,000</SelectItem>
                              <SelectItem value="over-8000">Over $8,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="creditScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credit Score Range</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-creditScore">
                                <SelectValue placeholder="Select credit range (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent (750+)</SelectItem>
                              <SelectItem value="good">Good (700-749)</SelectItem>
                              <SelectItem value="fair">Fair (650-699)</SelectItem>
                              <SelectItem value="poor">Poor (600-649)</SelectItem>
                              <SelectItem value="bad">Bad (below 600)</SelectItem>
                              <SelectItem value="unknown">I don't know</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="downPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Down Payment Amount</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-downPayment">
                                <SelectValue placeholder="Select down payment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">$0 (No down payment)</SelectItem>
                              <SelectItem value="1000">$1,000</SelectItem>
                              <SelectItem value="2500">$2,500</SelectItem>
                              <SelectItem value="5000">$5,000</SelectItem>
                              <SelectItem value="10000">$10,000</SelectItem>
                              <SelectItem value="15000">$15,000+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                  <FormField
                    control={form.control}
                    name="vehicleInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Vehicle of Interest</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. 2018 Honda Civic, Any SUV under $25K"
                            {...field}
                            data-testid="input-vehicleInterest"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information you'd like us to know about your financing needs..."
                          rows={4}
                          {...field}
                          data-testid="input-additionalInfo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-trex-green hover:bg-trex-green/90 text-white px-12 py-3 text-lg font-semibold"
                    disabled={form.formState.isSubmitting}
                    data-testid="button-submit"
                  >
                    {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </Form>

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