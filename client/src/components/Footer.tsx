import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock, Facebook } from "lucide-react";
import { SiGoogle, SiYelp } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png" 
                alt="T-Rex Motors Logo" 
                className="h-14 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your trusted partner for quality used cars in Richmond, IN since 2008. We're committed to helping you find the perfect vehicle.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-colors duration-300">
                <SiGoogle className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-colors duration-300">
                <SiYelp className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#inventory" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Browse Inventory</a></li>
              <li><Link href="/financing" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Apply for Financing</Link></li>
              <li><a href="#about" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">About Us</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-6">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Vehicle Inspection</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Trade-In Appraisal</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Extended Warranties</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Service Center</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">1300 South 9th St<br />Richmond, IN 47374</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <a href="tel:7652382887" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">(765) 238-2887</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <a href="mailto:info@trexmotors.com" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">info@trexmotors.com</a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Mon-Sat: 9AM-7PM<br />Sunday: 12PM-5PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; 2025 T-Rex Motors. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/privacy-policy" className="text-gray-500 hover:text-emerald-400 transition-colors">Privacy Policy</Link>
              <span className="text-gray-700">|</span>
              <Link href="/terms-of-service" className="text-gray-500 hover:text-emerald-400 transition-colors">Terms of Service</Link>
              <span className="text-gray-700">|</span>
              <a href="https://keanonbiz.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-emerald-400 transition-colors">
                Design by keanonbiz.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
