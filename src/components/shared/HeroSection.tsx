import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Brain } from 'lucide-react';

interface HeroSectionProps {
  badge?: {
    icon?: React.ReactNode;
    text: string;
  };
  title: string;
  highlightText?: string;
  description: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  backgroundVariant?: 'default' | 'gradient' | 'pattern';
  size?: 'default' | 'large';
}

export default function HeroSection({
  badge,
  title,
  highlightText,
  description,
  primaryCTA,
  secondaryCTA,
  backgroundVariant = 'default',
  size = 'default'
}: HeroSectionProps) {
  const getBackgroundClasses = () => {
    switch (backgroundVariant) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
      case 'pattern':
        return 'bg-gradient-to-br from-gray-50 to-blue-50';
      default:
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
    }
  };

  const getPaddingClasses = () => {
    return size === 'large' ? 'py-16 md:py-24' : 'py-12 md:py-20';
  };

  return (
    <section className={`relative ${getBackgroundClasses()} ${getPaddingClasses()}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: backgroundVariant === 'pattern' 
            ? `radial-gradient(circle at 20% 80%, #3B82F6 2px, transparent 2px),
               radial-gradient(circle at 80% 20%, #8B5CF6 2px, transparent 2px),
               radial-gradient(circle at 40% 40%, #06B6D4 2px, transparent 2px)`
            : `radial-gradient(circle at 25% 25%, #3B82F6 2px, transparent 2px)`,
          backgroundSize: backgroundVariant === 'pattern' ? '100px 100px' : '60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {badge && (
          <Badge className="mb-4 md:mb-6 bg-blue-100/90 backdrop-blur-sm text-blue-700 hover:bg-blue-200/90 border border-blue-200/50">
            {badge.icon && <span className="mr-2">{badge.icon}</span>}
            {badge.text}
          </Badge>
        )}
        
        <h1 className={`font-bold text-gray-900 mb-4 md:mb-6 leading-tight ${
          size === 'large' 
            ? 'text-4xl md:text-5xl lg:text-7xl' 
            : 'text-3xl md:text-4xl lg:text-6xl'
        }`}>
          {title}
          {highlightText && (
            <>
              {' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {highlightText}
              </span>
            </>
          )}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
        
        {(primaryCTA || secondaryCTA) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {primaryCTA && (
              <Button 
                size="lg" 
                className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                asChild
              >
                <Link href={primaryCTA.href}>
                  {primaryCTA.text}
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
                </Link>
              </Button>
            )}

            {secondaryCTA && (
              <Button 
                size="lg" 
                variant="outline"
                className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                asChild
              >
                <Link href={secondaryCTA.href}>
                  {secondaryCTA.icon && <span className="mr-2">{secondaryCTA.icon}</span>}
                  {secondaryCTA.text}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
} 