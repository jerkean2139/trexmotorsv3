import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[250px]">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png" 
                alt="T-Rex Motors Logo" 
                className="w-[250px] h-[250px] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.innerHTML = '<div class="flex items-center text-3xl font-bold text-green-600">🦖 T-Rex Motors</div>';
                  target.parentNode?.appendChild(fallback);
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection('inventory')}
                className="text-gray-900 hover:text-trex-green px-3 py-2 text-sm font-medium transition-colors"
              >
                Inventory
              </button>
              <Link href="/financing">
                <button className="text-gray-600 hover:text-trex-green px-3 py-2 text-sm font-medium transition-colors">
                  Financing
                </button>
              </Link>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-600 hover:text-trex-green px-3 py-2 text-sm font-medium transition-colors"
              >
                About Us
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-600 hover:text-trex-green px-3 py-2 text-sm font-medium transition-colors"
              >
                Contact
              </button>
              {/* Admin link */}
              <Link href="/admin">
                <button className="text-gray-600 hover:text-trex-green px-3 py-2 text-sm font-medium transition-colors">
                  Admin
                </button>
              </Link>

            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  <i className="fas fa-bars text-xl"></i>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <button 
                    onClick={() => scrollToSection('inventory')}
                    className="text-gray-900 block px-3 py-2 text-base font-medium text-left"
                  >
                    Inventory
                  </button>
                  <Link href="/financing">
                    <button className="text-gray-600 hover:text-trex-green block px-3 py-2 text-base font-medium text-left">
                      Financing
                    </button>
                  </Link>
                  <button 
                    onClick={() => scrollToSection('about')}
                    className="text-gray-600 hover:text-trex-green block px-3 py-2 text-base font-medium text-left"
                  >
                    About Us
                  </button>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="text-gray-600 hover:text-trex-green block px-3 py-2 text-base font-medium text-left"
                  >
                    Contact
                  </button>
                  {/* Admin link */}
                  <Link href="/admin">
                    <button className="text-gray-600 hover:text-trex-green block px-3 py-2 text-base font-medium text-left">
                      Admin
                    </button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
