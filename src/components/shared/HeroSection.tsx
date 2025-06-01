import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  };
  backgroundVariant?: 'gradient' | 'solid' | 'pattern';
  className?: string;
}

export default function HeroSection({
  badge,
  title,
  highlightText,
  description,
  primaryCTA,
  secondaryCTA,
  backgroundVariant = 'gradient',
  className = ''
}: HeroSectionProps) {
  const getBackgroundClasses = () => {
    switch (backgroundVariant) {
      case 'solid':
        return 'bg-blue-600';
      case 'pattern':
        return 'bg-gray-50 relative overflow-hidden';
      case 'gradient':
      default:
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden';
    }
  };

  return (
    <section className={`py-20 ${getBackgroundClasses()} ${className}`}>
      {/* Background Pattern for pattern variant */}
      {backgroundVariant === 'pattern' && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      )}

      {/* Floating Background Elements for gradient variant */}
      {backgroundVariant === 'gradient' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg blur-xl floating" />
          <div className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/25 to-pink-400/25 rounded-full blur-lg floating-delayed" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-indigo-400/15 to-blue-400/15 rounded-2xl blur-2xl floating" />
          <div className="absolute top-1/2 right-10 w-28 h-28 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-lg blur-xl floating-delayed" />
          
          {/* Mobile-optimized particles */}
          <div className="hidden md:block">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-40 floating"
                style={{
                  left: `${(i * 12) % 100}%`,
                  top: `${(i * 15) % 100}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="fade-in-up">
          {badge && (
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200 scale-in stagger-1">
              {badge.icon && <span className="mr-2">{badge.icon}</span>}
              {badge.text}
            </Badge>
          )}
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight fade-in-up stagger-2">
            {title}{' '}
            {highlightText && (
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {highlightText}
              </span>
            )}
          </h1>
        </div>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed fade-in-up stagger-3">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up stagger-4">
          {primaryCTA && (
            primaryCTA.onClick ? (
              <Button
                onClick={primaryCTA.onClick}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold hover-lift btn-shine"
              >
                {primaryCTA.text}
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold hover-lift btn-shine"
              >
                <Link href={primaryCTA.href}>
                  {primaryCTA.text}
                </Link>
              </Button>
            )
          )}

          {secondaryCTA && (
            secondaryCTA.onClick ? (
              <Button
                onClick={secondaryCTA.onClick}
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-semibold hover-lift"
              >
                {secondaryCTA.text}
                {secondaryCTA.icon && <span className="ml-2">{secondaryCTA.icon}</span>}
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-semibold hover-lift"
              >
                <Link href={secondaryCTA.href}>
                  {secondaryCTA.text}
                  {secondaryCTA.icon && <span className="ml-2">{secondaryCTA.icon}</span>}
                </Link>
              </Button>
            )
          )}
        </div>
      </div>
    </section>
  );
} 