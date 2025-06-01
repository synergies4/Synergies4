'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Star,
  CheckCircle,
  Zap,
  Target,
  Brain,
  Rocket,
  Eye,
  Heart,
  Lightbulb
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
};

// Enhanced button animation variants
const buttonHover = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

const buttonTap = {
  scale: 0.98,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

// Scroll-triggered animation hook
function useScrollAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return { ref, isInView };
}

// Counter animation hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return { count, setIsVisible };
}

export default function AboutUs() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const { user } = useAuth();

  return (
    <main className="min-h-screen">
      {/* Countdown Banner */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-sm md:text-base"
            >
              🚀 Expand your potential through learning. Offering earlybirds a discount of $295.00.
            </motion.p>
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {['00 Days', '00 Hours', '00 Minutes', '00 Seconds'].map((time, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                  {time}
                </Badge>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.nav 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href="/" className="flex items-center">
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.02,
                    textShadow: "0 0 8px rgba(59, 130, 246, 0.5)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  Synergies4
                </motion.span>
              </Link>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                >
                  <Link 
                    href={
                      item === 'About Us' ? '/about-us' :
                      item === 'Courses' ? '/courses' :
                      item === 'Coaching' ? '/coaching' : 
                      item === 'Consulting' ? '/consulting' : 
                      item === 'Industry Insight' ? '/industry-insight' :
                      `/${item.toLowerCase().replace(' ', '-')}`
                    } 
                    className={`text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                      item === 'About Us' ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {user ? (
                <UserAvatar />
              ) : (
                <>
                  <Button variant="ghost" asChild className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-colors">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Gradient Shapes */}
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg blur-xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/25 to-pink-400/25 rounded-full blur-lg"
            animate={{
              x: [0, -25, 0],
              y: [0, 15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-indigo-400/15 to-blue-400/15 rounded-2xl blur-2xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/2 right-10 w-28 h-28 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-lg blur-xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 25, 0],
              rotate: [0, 270, 360],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute bottom-32 right-1/3 w-36 h-36 bg-gradient-to-br from-violet-400/18 to-purple-400/18 rounded-full blur-2xl"
            animate={{
              x: [0, 35, 0],
              y: [0, -40, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          />
          
          {/* Pixelated Grid Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 md:grid-cols-20 lg:grid-cols-32 h-full gap-1">
              {Array.from({ length: 384 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-sm"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.3, 0],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.01,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Floating Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-40"
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, (i % 2 === 0 ? 25 : -25), 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 4 + (i % 4),
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
        </div>

        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Badge className="mb-6 bg-blue-100/90 backdrop-blur-sm text-blue-700 hover:bg-blue-200/90 border border-blue-200/50">
              <Heart className="w-4 h-4 mr-2" />
              About Synergies4
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Growth Journey{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Synergies4 helps teams lead better, adapt faster, and work smarter with AI.
          </motion.p>
          
          <motion.div
            className="text-lg text-gray-700 max-w-4xl mx-auto space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <p>We're not consultants. We're integration partners.</p>
            <p>We train people to think clearly, lead confidently, and build organizations that thrive in complexity.</p>
            <p>Our tools include AI, adult development, and human-centered design.</p>
            <div className="text-xl font-semibold text-blue-600 mt-6">
              <p>Our mission is simple. Sharper minds. Stronger teams. Healthier workplaces.</p>
              <p className="mt-2">Real results. No fluff.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <MissionSection />

      {/* Statistics Section */}
      <StatisticsSection />

      {/* What Makes Us Special Section */}
      <SpecialSection />

      {/* About Details Section */}
      <AboutDetailsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}

// Mission Section Component
function MissionSection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Unlock Potential. Empower Growth. Share Brilliance.
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We believe in transformative learning experiences that go beyond traditional training. Our approach combines cutting-edge AI technology with proven methodologies to create lasting change in individuals and organizations.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Statistics Section Component
function StatisticsSection() {
  const { ref, isInView } = useScrollAnimation();

  const stats = [
    { label: "Students Enrolled", value: 95432, suffix: "" },
    { label: "Success Rate", value: 100, suffix: "%" },
    { label: "Classes Conducted", value: 25684, suffix: "+" },
    { label: "Certifications", value: 25600, suffix: "+" }
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
        >
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} isInView={isInView} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

// Stat Card Component
function StatCard({ stat, index, isInView }: { stat: any, index: number, isInView: boolean }) {
  const { count, setIsVisible } = useCounter(stat.value);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsVisible(true), index * 200);
      return () => clearTimeout(timer);
    }
  }, [isInView, index, setIsVisible]);

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ scale: 1.05, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="text-center"
    >
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardContent className="pt-6">
          <motion.div
            className="text-4xl md:text-5xl font-bold mb-2"
            animate={{ scale: isInView ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {count.toLocaleString()}{stat.suffix}
          </motion.div>
          <p className="text-lg font-medium opacity-90">
            {stat.label}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// What Makes Us Special Section Component
function SpecialSection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gray-50"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            What Makes Us Special
          </h2>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="max-w-5xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <p className="text-xl text-gray-700 leading-relaxed text-center">
                Synergies4 blends AI, agility, and human insight to create practical, role-based learning that sticks. We don't just teach frameworks—we equip people with personalized AI tools, real-time support, and future-ready skills they can use every day. Our programs are led by real transformation leaders, not theorists, and we design every experience to solve real-world challenges—not chase trends.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}

// About Details Section Component
function AboutDetailsSection() {
  const { ref, isInView } = useScrollAnimation();

  const details = [
    {
      title: "Who are we?",
      content: "We're a team of transformation leaders, AI innovators, and agile experts who believe learning should be practical, personalized, and built for the real world. At Synergies4, we help professionals and organizations lead smarter, move faster, and deliver more value—by blending modern AI with proven frameworks and hands-on experience. We don't just teach change—we help you master it.",
      icon: <Users className="h-8 w-8" />
    },
    {
      title: "What we do?",
      content: "We design and deliver AI-powered, role-based training and consulting programs that help individuals and organizations thrive in the modern world of work. Through hands-on learning, real-time tools, and expert coaching, we equip teams to use AI, agility, and human insight to solve real problems, drive value, and lead with confidence.",
      icon: <Rocket className="h-8 w-8" />
    },
    {
      title: "Our Vision",
      content: "Our vision is to empower every professional to lead with clarity, confidence, and intelligence—by making AI practical, agility human, and learning continuous. We envision a future where organizations thrive through people who are equipped to adapt, innovate, and deliver meaningful impact—every day.",
      icon: <Eye className="h-8 w-8" />
    }
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {details.map((detail, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    {detail.icon}
                  </div>
                  <CardTitle className="text-xl text-blue-600">{detail.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{detail.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const { ref, isInView } = useScrollAnimation();

  const testimonials = [
    {
      quote: "Before Synergies4's Agile Mastery course, our team was struggling with deadlines and unclear priorities. The hands-on sprints and real-world simulations completely transformed how we manage projects. I implemented the agile board technique from week one and our delivery time improved by 40%. This course didn't just teach Agile – it helped us live it.",
      author: "Bennett Cu",
      role: "Project Manager",
      avatar: "BC"
    },
    {
      quote: "I had read about Agile but never truly understood its depth until I took Synergies4's course. The way the instructor broke down Scrum ceremonies and Kanban flows made it click for me. Now, I not only contribute more actively in sprint planning – I also suggested a backlog grooming process that impressed my seniors!",
      author: "Kyle Miller",
      role: "Senior Developer",
      avatar: "KM"
    },
    {
      quote: "Synergies4's Agile Coaching Bootcamp was a game-changer. The coaching sessions and roleplays taught me how to facilitate retrospectives with empathy and purpose. My team is now more self-organizing, and our morale has never been better. It's not just a course – it's leadership training in disguise.",
      author: "Sarah Graham",
      role: "Team Lead",
      avatar: "SG"
    },
    {
      quote: "As a freelancer, I always thought Agile was only for big teams. But Synergies4's course helped me adapt it to my solo workflows and client projects. Using Agile principles, I now deliver more consistent value, and client feedback has improved drastically. Highly recommended for independent creatives.",
      author: "Tariq Zeeshan",
      role: "Freelancer",
      avatar: "TZ"
    }
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gray-50"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from professionals who transformed their careers with Synergies4.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-600 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Footer Section Component
function FooterSection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <motion.footer 
      ref={ref}
      className="bg-gray-900 text-white py-16"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <motion.div variants={fadeInUp}>
            <Image 
              src="/synergies4_logo.jpeg" 
              alt="Synergies4 Logo" 
              width={150} 
              height={72} 
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-gray-400 mb-4">
              AI-powered learning tailored uniquely to you and your organization.
            </p>
            <div className="flex space-x-4">
              {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">{social}</span>
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-semibold mb-4">Courses</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Agile & Scrum</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Product Management</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Leadership</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Business Analysis</a></li>
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/coaching" className="hover:text-white transition-colors">Coaching</Link></li>
              <li><Link href="/consulting" className="hover:text-white transition-colors">Consulting</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </motion.div>
        </div>

        <Separator className="bg-gray-800 mb-8" />

        <motion.div 
          className="text-center text-gray-400"
          variants={fadeInUp}
        >
          <p>&copy; {new Date().getFullYear()} Synergies4 LLC. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Synergies4™, PocketCoachAI™, Adaptive Content Pods™ are trademarks of Synergies4 LLC.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
} 