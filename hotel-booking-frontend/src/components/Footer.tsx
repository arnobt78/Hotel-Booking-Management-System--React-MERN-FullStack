import { Link } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary-800 to-primary-900 text-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-2xl font-bold">BookInn</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Discover amazing hotels, resorts, and accommodations worldwide.
              Book with confidence and enjoy unforgettable experiences.
            </p>

            {/* Socials (external) */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links (internal) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Hotels
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Destinations
                </Link>
              </li>
            </ul>
          </div>

          {/* Support (internal) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/api-docs"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/api-docs"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Booking Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/api-docs"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info (mailto/tel) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="mailto:support@bookinn.com"
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 text-primary-300" />
                <span>support@bookinn.com</span>
              </a>

              <a
                href="tel:+15551234567"
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 text-primary-300" />
                <span>+1 (555) 123-4567</span>
              </a>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-300" />
                <span className="text-gray-300">
                  123 Travel St, Tourism City
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2025 BookInn. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
