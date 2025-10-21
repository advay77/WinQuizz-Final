import React from "react";
import {
  Trophy,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

const Footer: React.FC = (): JSX.Element => {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-red-600 p-2 rounded-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold">WinQuizz</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              India's most trusted skill-based contest platform. Test your
              knowledge, prove your speed, and win exciting rewards in our fair
              and transparent contests.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#prizes"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  Prizes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  Live Contests
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  Leaderboard
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  Refund Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  Responsible Gaming
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-semibold">Email Support</p>
                <p className="text-gray-300 text-sm">support@winquizz.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-semibold">Phone Support</p>
                <p className="text-gray-300 text-sm">+91 9876-543-210</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-semibold">Registered Office</p>
                <p className="text-gray-300 text-sm">
                  Mumbai, Maharashtra, India
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} WinQuizz. All rights reserved. | GST:
              27XXXXX1234X1ZX
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                18+ Only
              </span>
              <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                Skill-Based
              </span>
              <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                GST Registered
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
