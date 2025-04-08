import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary-700 rounded-lg shadow-xl overflow-hidden">
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
            <div className="lg:self-center lg:max-w-2xl">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to find your next home service professional?</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-white">
                Join thousands of homeowners who trust our platform for reliable, quality service providers.
              </p>
              <div className="mt-8 flex">
                <div className="inline-flex rounded-md shadow">
                  <Link href="/search">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-neutral-50"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
                <div className="ml-3 inline-flex">
                  <Link href="#how-it-works">
                    <Button 
                      size="lg" 
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-800 hover:bg-primary-900"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
