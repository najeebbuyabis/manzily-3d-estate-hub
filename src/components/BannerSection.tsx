import React from "react";
import AdvertisingBanner from "./AdvertisingBanner";

interface BannerSectionProps {
  className?: string;
  variant?: "top" | "middle" | "sidebar";
}

const BannerSection: React.FC<BannerSectionProps> = ({ className = "", variant = "middle" }) => {
  if (variant === "top") {
    return (
      <section className={`py-8 bg-accent/30 ${className}`}>
        <div className="container mx-auto px-4 lg:px-8">
          <AdvertisingBanner
            title="Premium Investment Opportunities"
            description="Discover exclusive real estate investment opportunities with guaranteed returns. Join thousands of successful investors."
            imageUrl="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop"
            ctaText="Learn More"
            ctaLink="https://example.com/investment"
            badge="Featured"
            variant="horizontal"
          />
        </div>
      </section>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className={`space-y-6 ${className}`}>
        <AdvertisingBanner
          title="Smart Home Technology"
          description="Upgrade your property with the latest smart home solutions."
          imageUrl="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop"
          ctaText="Shop Now"
          ctaLink="https://example.com/smart-home"
          badge="New"
          variant="vertical"
        />
        <AdvertisingBanner
          title="Property Insurance"
          description="Protect your investment with comprehensive property insurance."
          imageUrl="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
          ctaText="Get Quote"
          ctaLink="https://example.com/insurance"
          badge="Trusted"
          variant="vertical"
        />
      </div>
    );
  }

  // Default middle variant
  return (
    <section className={`py-12 bg-background ${className}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AdvertisingBanner
            title="Mortgage Solutions Made Easy"
            description="Get pre-approved for your dream home with our simplified mortgage process. Competitive rates and fast approval."
            imageUrl="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=300&fit=crop"
            ctaText="Apply Now"
            ctaLink="https://example.com/mortgage"
            badge="Hot Deal"
            variant="horizontal"
          />
          <AdvertisingBanner
            title="Virtual Property Tours"
            description="Experience properties like never before with our immersive 3D virtual tours and AR technology."
            imageUrl="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=300&fit=crop"
            ctaText="Try Demo"
            ctaLink="https://example.com/virtual-tours"
            badge="Innovation"
            variant="horizontal"
          />
        </div>
      </div>
    </section>
  );
};

export default BannerSection;