import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DealershipProvider } from "@/context/DealershipContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import AdminSubmissions from "@/pages/admin-submissions";
import Financing from "@/pages/financing";
import ThankYou from "@/pages/thank-you";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/submissions" component={AdminSubmissions} />
      <Route path="/financing" component={Financing} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DealershipProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </DealershipProvider>
    </QueryClientProvider>
  );
}

export default App;
