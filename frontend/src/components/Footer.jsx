import React from 'react';
import { Link } from 'react-router-dom';
import { FaStethoscope, FaHeart, FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2 text-brand-400 font-extrabold text-2xl tracking-tight">
            <FaStethoscope className="text-3xl" />
            <span className="font-['Outfit'] font-extrabold">Med<span className="text-white">Connect</span></span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            MedConnect is a trusted full-stack healthcare platform connecting patients with top medical specialists. Manage slot schedules, download lab reports, and perform telehealth consulting securely.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="#" className="h-8 w-8 rounded-full bg-slate-800 hover:bg-brand-500 hover:text-white transition-colors flex items-center justify-center text-sm"><FaFacebookF /></a>
            <a href="#" className="h-8 w-8 rounded-full bg-slate-800 hover:bg-brand-500 hover:text-white transition-colors flex items-center justify-center text-sm"><FaTwitter /></a>
            <a href="#" className="h-8 w-8 rounded-full bg-slate-800 hover:bg-brand-500 hover:text-white transition-colors flex items-center justify-center text-sm"><FaLinkedinIn /></a>
            <a href="#" className="h-8 w-8 rounded-full bg-slate-800 hover:bg-brand-500 hover:text-white transition-colors flex items-center justify-center text-sm"><FaYoutube /></a>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-white font-semibold text-base mb-5 font-['Outfit']">Quick Links</h4>
          <ul className="space-y-3.5 text-sm">
            <li><Link to="/doctors" className="hover:text-white transition-colors">Search Doctors</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Sign In Account</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Join as Doctor / Patient</Link></li>
            <li><a href="#faqs" className="hover:text-white transition-colors">Frequently Asked FAQs</a></li>
          </ul>
        </div>

        {/* Specialities */}
        <div>
          <h4 className="text-white font-semibold text-base mb-5 font-['Outfit']">Specialities</h4>
          <ul className="space-y-3.5 text-sm">
            <li><Link to="/doctors?specialization=Cardiologist" className="hover:text-white transition-colors">Cardiologist</Link></li>
            <li><Link to="/doctors?specialization=Neurologist" className="hover:text-white transition-colors">Neurologist</Link></li>
            <li><Link to="/doctors?specialization=Dermatologist" className="hover:text-white transition-colors">Dermatologist</Link></li>
            <li><Link to="/doctors?specialization=Pediatrician" className="hover:text-white transition-colors">Pediatrician</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold text-base mb-5 font-['Outfit']">Contact Info</h4>
          <ul className="space-y-3.5 text-sm">
            <li>Email: <a href="mailto:support@medconnect.com" className="hover:text-white transition-colors">support@medconnect.com</a></li>
            <li>Phone: <a href="tel:+18005550199" className="hover:text-white transition-colors">+1 (800) 555-0199</a></li>
            <li>Location: 451 Health Science Drive, Suite 100, New York, NY</li>
          </ul>
        </div>
      </div>

      {/* Under Section */}
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} MedConnect Inc. All rights reserved.</p>
        <p className="flex items-center mt-2 md:mt-0">
          Made with <FaHeart className="text-red-500 mx-1 animate-pulse" /> for healthy communities.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
