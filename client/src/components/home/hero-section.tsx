import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-neutral-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Quality home services</span>{" "}
                <span className="block text-primary-600 xl:inline">from verified professionals</span>
              </h1>
              <p className="mt-3 text-base text-neutral-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Connect with reliable plumbers, electricians, and landscapers in your area. Book services with confidence using our trusted platform.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link href="/search">
                    <Button size="lg" className="w-full">
                      Find Services
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  {!user ? (
                    <Link href="/auth">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 border-primary-100 hover:border-primary-200"
                      >
                        Become a Provider
                      </Button>
                    </Link>
                  ) : user.role === "provider" ? (
                    <Link href="/profile">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 border-primary-100 hover:border-primary-200"
                      >
                        Manage Services
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 border-primary-100 hover:border-primary-200"
                      >
                        Become a Provider
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full bg-neutral-200 sm:h-72 md:h-96 lg:w-full lg:h-full">
          {/* This div creates a placeholder for the image that would be loaded from URL */}
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
