import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Car, Calculator, Users, Phone, Settings } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Inventory", action: () => scrollToSection('inventory'), icon: Car },
    { label: "Financing", href: "/financing", icon: Calculator },
    { label: "About Us", action: () => scrollToSection('about'), icon: Users },
    { label: "Contact", action: () => scrollToSection('contact'), icon: Phone },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28 md:h-36">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img 
              src="https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png" 
              alt="T-Rex Motors Logo" 
              className="h-24 md:h-32 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              item.href ? (
                <Link key={item.label} href={item.href}>
                  <button className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#72E118] transition-colors duration-200 rounded-lg hover:bg-[#72E118]/10 group">
                    {item.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#72E118] transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
                  </button>
                </Link>
              ) : (
                <button 
                  key={item.label}
                  onClick={item.action}
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#72E118] transition-colors duration-200 rounded-lg hover:bg-[#72E118]/10 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#72E118] transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
                </button>
              )
            ))}
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="ml-2 text-gray-500 hover:text-gray-700">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block">
            <Button 
              onClick={() => scrollToSection('inventory')}
              className="bg-[#72E118] hover:bg-[#5CBF12] text-white shadow-lg shadow-[#72E118]/25 hover:shadow-[#72E118]/40 transition-all duration-300"
            >
              Browse Inventory
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80">
                <div className="flex flex-col mt-8">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b">
                    <img 
                      src="https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png" 
                      alt="T-Rex Motors" 
                      className="h-10 w-auto"
                    />
                    <span className="font-semibold text-gray-900">T-Rex Motors</span>
                  </div>
                  
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return item.href ? (
                        <Link key={item.label} href={item.href}>
                          <button 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-[#72E118] hover:bg-[#72E118]/10 rounded-lg transition-colors"
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </button>
                        </Link>
                      ) : (
                        <button 
                          key={item.label}
                          onClick={() => {
                            item.action?.();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-[#72E118] hover:bg-[#72E118]/10 rounded-lg transition-colors"
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <Button 
                      onClick={() => {
                        scrollToSection('inventory');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-[#72E118] hover:bg-[#5CBF12] text-white"
                    >
                      Browse Inventory
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
