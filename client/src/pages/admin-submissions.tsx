import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Inquiry {
  id: string;
  vehicleId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interestType: string;
  message: string | null;
  createdAt: string;
}

interface FinancingApplication {
  id: string;
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
  creditScore: string | null;
  downPayment: string | null;
  vehicleInterest: string | null;
  additionalInfo: string | null;
  createdAt: string;
}

function AdminSubmissions() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [financingApps, setFinancingApps] = useState<FinancingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDealershipId, setSelectedDealershipId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminSelectedDealership') || "";
    }
    return "";
  });

  // Check authentication - use same endpoint as main admin page
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
            fetchData();
          } else {
            setLocation('/admin');
          }
        } else {
          setLocation('/admin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setLocation('/admin');
      }
    };

    checkAuth();
  }, [setLocation]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Build query params with dealership filter
      const params = new URLSearchParams();
      if (selectedDealershipId) {
        params.set('dealershipId', selectedDealershipId);
      }
      
      // Fetch inquiries and financing applications simultaneously
      const [inquiriesResponse, financingResponse] = await Promise.all([
        fetch(`/api/inquiries?${params.toString()}`, { credentials: 'include' }),
        fetch(`/api/financing-applications?${params.toString()}`, { credentials: 'include' })
      ]);

      if (inquiriesResponse.ok) {
        const inquiriesData = await inquiriesResponse.json();
        setInquiries(inquiriesData);
      }

      if (financingResponse.ok) {
        const financingData = await financingResponse.json();
        setFinancingApps(financingData);
      }

    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trex-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <img 
                  src="https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png" 
                  alt="T-Rex Motors Logo" 
                  className="w-12 h-12 object-contain cursor-pointer"
                />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Submissions Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline">Back to Admin</Button>
              </Link>
              <Button
                onClick={() => window.location.reload()}
                className="bg-trex-green hover:bg-trex-green/90"
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { 
                      method: 'POST',
                      credentials: 'include'
                    });
                    setLocation('/admin');
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                data-testid="button-logout"
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-trex-green">{inquiries.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Financing Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-trex-green">{financingApps.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-trex-green">{inquiries.length + financingApps.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="inquiries" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inquiries">
              Vehicle Inquiries ({inquiries.length})
            </TabsTrigger>
            <TabsTrigger value="financing">
              Financing Applications ({financingApps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inquiries" className="space-y-4">
            {inquiries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No vehicle inquiries yet.</p>
                </CardContent>
              </Card>
            ) : (
              inquiries.map((inquiry) => (
                <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {inquiry.firstName} {inquiry.lastName}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span><i className="fas fa-envelope mr-1"></i>{inquiry.email}</span>
                          <span><i className="fas fa-phone mr-1"></i>{inquiry.phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{inquiry.interestType}</Badge>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(inquiry.createdAt)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {inquiry.message && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                        <p className="text-gray-600">{inquiry.message}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        ID: {inquiry.id.slice(0, 8)}...
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`mailto:${inquiry.email}`, '_blank')}
                        >
                          <i className="fas fa-envelope mr-2"></i>
                          Email
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${inquiry.phone}`, '_blank')}
                        >
                          <i className="fas fa-phone mr-2"></i>
                          Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="financing" className="space-y-4">
            {financingApps.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <i className="fas fa-calculator text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No financing applications yet.</p>
                </CardContent>
              </Card>
            ) : (
              financingApps.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {app.firstName} {app.lastName}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span><i className="fas fa-envelope mr-1"></i>{app.email}</span>
                          <span><i className="fas fa-phone mr-1"></i>{app.phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Financing Application</Badge>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(app.createdAt)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Address</p>
                          <p className="text-sm text-gray-600">
                            {app.address}<br />
                            {app.city}, {app.state} {app.zipCode}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Employment Status</p>
                          <p className="text-sm text-gray-600">{app.employmentStatus}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Monthly Income</p>
                          <p className="text-sm text-gray-600">{app.monthlyIncome}</p>
                        </div>
                        {app.creditScore && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Credit Score Range</p>
                            <p className="text-sm text-gray-600">{app.creditScore}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {(app.downPayment || app.vehicleInterest || app.additionalInfo) && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        {app.downPayment && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Down Payment</p>
                            <p className="text-sm text-gray-600">{app.downPayment}</p>
                          </div>
                        )}
                        {app.vehicleInterest && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Vehicle of Interest</p>
                            <p className="text-sm text-gray-600">{app.vehicleInterest}</p>
                          </div>
                        )}
                        {app.additionalInfo && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Additional Information</p>
                            <p className="text-sm text-gray-600">{app.additionalInfo}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        ID: {app.id.slice(0, 8)}...
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`mailto:${app.email}`, '_blank')}
                        >
                          <i className="fas fa-envelope mr-2"></i>
                          Email
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${app.phone}`, '_blank')}
                        >
                          <i className="fas fa-phone mr-2"></i>
                          Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default AdminSubmissions;