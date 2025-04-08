import { Link } from "wouter";
import { Star, MapPin, DollarSign, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProviderCardProps {
  provider: any;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  if (!provider || !provider.providerProfile) return null;
  
  const { id, name, city, profileImage, providerProfile } = provider;
  const { hourlyRate, category, isVerified } = providerProfile;
  
  // This would typically come from the API, but we'll simulate it for now
  const rating = 4.5 + Math.random() * 0.5;
  const reviewCount = Math.floor(50 + Math.random() * 100);
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative h-48">
        <div className="absolute inset-0 bg-neutral-200">
          {/* Placeholder for provider image */}
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <span className="text-xs font-medium leading-none text-green-800">{rating.toFixed(1)}</span>
          </span>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">{name}</h3>
            <p className="text-sm text-neutral-500 capitalize">{category}</p>
          </div>
          <div className="flex-shrink-0">
            {isVerified && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="flex text-accent-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-accent-500" : ""}`}
              />
            ))}
          </div>
          <p className="ml-2 text-sm text-neutral-500">{reviewCount} reviews</p>
        </div>
        <div className="mt-2 flex items-center text-sm text-neutral-500">
          <MapPin className="h-4 w-4 mr-1" />
          <p>{city || "Location not specified"}</p>
        </div>
        <div className="mt-2 flex items-center text-sm text-neutral-500">
          <DollarSign className="h-4 w-4 mr-1" />
          <p>${hourlyRate}/hour</p>
        </div>
        <div className="mt-4">
          <Link href={`/providers/${id}`}>
            <a className="text-primary-600 hover:text-primary-700 font-medium">View Profile</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
