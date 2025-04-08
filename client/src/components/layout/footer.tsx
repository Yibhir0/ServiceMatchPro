import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <h2 className="text-lg font-bold">HomeHelp</h2>
            <p className="text-neutral-300 text-base">
              Connecting homeowners with verified service professionals since 2023.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">
                  For Customers
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="#how-it-works" className="text-base text-neutral-400 hover:text-white">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <Link href="/search">
                      <a className="text-base text-neutral-400 hover:text-white">
                        Find Services
                      </a>
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      FAQs
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">
                  For Providers
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/auth">
                      <a className="text-base text-neutral-400 hover:text-white">
                        Join as a Provider
                      </a>
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Provider Resources
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Success Stories
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Provider FAQs
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">
                  Company
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">
                  Legal
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-400 hover:text-white">
                      Licenses
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-neutral-700 pt-8">
          <p className="text-base text-neutral-400 xl:text-center">
            &copy; 2023 HomeHelp, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
