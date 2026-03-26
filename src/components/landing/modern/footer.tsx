'use client';

import Link from 'next/link';

const ModernFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-white text-lg mb-4">KaziHome</h3>
            <p>Connecting talent with opportunity.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">For Workers</h4>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="hover:text-white">Browse Jobs</Link></li>
              <li><Link href="/auth/signup?role=worker" className="hover:text-white">Create Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">For Employers</h4>
            <ul className="space-y-2">
              <li><Link href="/workers" className="hover:text-white">Find Workers</Link></li>
              <li><Link href="/auth/signup?role=employer" className="hover:text-white">Post a Job</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} KaziHome. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
