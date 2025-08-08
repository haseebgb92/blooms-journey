
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Baby, Clock, Users, Star, ArrowRight, Shield, Award, Zap, Sparkles, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push('/onboarding');
  };

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector('.hero-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Personalized Care",
      description: "Get personalized advice and tracking based on your pregnancy stage and preferences.",
      color: "from-pink-400 to-red-400",
      bgColor: "bg-pink-50",
      benefits: ["AI-powered recommendations", "Week-by-week tracking", "Customized content"]
    },
    {
      icon: Clock,
      title: "Daily Updates",
      description: "Receive daily notifications and updates about your baby's development and your health.",
      color: "from-pink-400 to-purple-400",
      bgColor: "bg-pink-50",
      benefits: ["Real-time notifications", "Health reminders", "Progress tracking"]
    },
    {
      icon: Users,
      title: "Family Support",
      description: "Connect with your partner and family to share your pregnancy journey together.",
      color: "from-pink-400 to-red-400",
      bgColor: "bg-pink-50",
      benefits: ["Partner integration", "Family sharing", "Community support"]
    }
  ];

  const testimonials = [
    {
      name: "Lauren R",
      role: "First-time mom",
      content: "Absolutely the best app! Did so much research before choosing one and this one is amazing! The fact that my husband and I get different things daily but can communicate through our apps is so amazing!",
      rating: 5
    },
    {
      name: "Sarah M",
      role: "Second-time mom",
      content: "This app has been a lifesaver during my pregnancy. The daily updates and reminders help me stay on track with everything.",
      rating: 5
    },
    {
      name: "Jessica K",
      role: "Expecting mom",
      content: "The personalized care and expert guidance make me feel so supported throughout my pregnancy journey.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-red-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-200 to-red-200 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header with Login/Signup */}
      <header className="relative z-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-sm"></div>
                <Image
                  src="/images/icon.png"
                  alt="Bloom Journey Logo"
                  width={48}
                  height={48}
                  className="relative rounded-full border-2 border-white shadow-lg w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
                />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-pink-900">
                Bloom Journey
              </span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
              <Link href="/login">
                <Button variant="ghost" className="text-pink-900 hover:text-pink-700 hover:bg-pink-50 transition-all duration-300 text-sm sm:text-base">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className={`text-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 hero-section ${isVisible ? 'animate-slide-in-up' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {/* Main Logo and Title */}
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto mb-6 sm:mb-8 lg:mb-12">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
                  <div className="w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <div className="relative">
                      <Baby className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-red-400 animate-bounce" style={{ animationDuration: '2s' }} />
                      <Sparkles className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 lg:-top-3 lg:-right-3 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-400 animate-ping" />
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 lg:-top-6 lg:-right-6 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 lg:-bottom-6 lg:-left-6 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 text-pink-900">
                Bloom Journey
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-pink-800 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 lg:mb-12 px-4">
                Your complete pregnancy companion - from first plans to your child's third birthday. 
                <span className="font-semibold text-pink-900"> Personalized care, expert guidance, and daily support</span> for your beautiful journey.
              </p>
              
              {/* Stats */}
              <div className="flex justify-center items-center space-x-4 sm:space-x-8 lg:space-x-12 mb-6 sm:mb-8 lg:mb-12">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-900">10K+</div>
                  <div className="text-sm sm:text-base lg:text-lg text-pink-700">Happy Moms</div>
                </div>
                <div className="w-px h-6 sm:h-8 lg:h-12 bg-pink-300"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-900">4.9★</div>
                  <div className="text-sm sm:text-base lg:text-lg text-pink-700">App Rating</div>
                </div>
                <div className="w-px h-6 sm:h-8 lg:h-12 bg-pink-300"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-900">24/7</div>
                  <div className="text-sm sm:text-base lg:text-lg text-pink-700">Support</div>
                </div>
              </div>
            </div>

            {/* Get Started Button */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
              <Button 
                onClick={handleGetStarted}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white text-lg sm:text-xl lg:text-2xl px-8 sm:px-12 lg:px-16 py-6 sm:py-8 lg:py-10 h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-900 mb-4 lg:mb-6">
                Everything you need for your pregnancy journey
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-pink-700 max-w-3xl mx-auto">
                Comprehensive tools and support to make your pregnancy journey beautiful and stress-free
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-0 ${feature.bgColor} ${
                    currentFeature === index ? 'ring-4 ring-pink-200' : ''
                  }`}
                >
                  <CardContent className="p-6 sm:p-8 lg:p-10">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-lg`}>
                      <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-pink-900 mb-3 sm:mb-4 lg:mb-6">{feature.title}</h3>
                    <p className="text-sm sm:text-base lg:text-lg text-pink-700 leading-relaxed mb-4 sm:mb-6 lg:mb-8">
                      {feature.description}
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-500" />
                          <span className="text-xs sm:text-sm lg:text-base text-pink-600">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-900 mb-4 lg:mb-6">
                What moms are saying
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-pink-700">
                Join thousands of satisfied moms who trust Bloom Journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <CardContent className="p-6 sm:p-8 lg:p-10">
                    <div className="flex justify-center mb-4 sm:mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-sm sm:text-base lg:text-lg text-pink-700 italic text-center mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                        <span className="text-white font-bold text-sm sm:text-base lg:text-lg">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <p className="font-semibold text-sm sm:text-base lg:text-lg text-pink-900">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm lg:text-base text-pink-600">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center bg-gradient-to-br from-pink-50 to-pink-100">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-900 mb-4 sm:mb-6 lg:mb-8">
                Ready to start your journey?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-pink-700 mb-6 sm:mb-8 lg:mb-12 leading-relaxed">
                Join thousands of moms who trust Bloom Journey for their pregnancy journey. 
                Start your beautiful adventure today!
              </p>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white text-lg sm:text-xl lg:text-2xl px-8 sm:px-12 lg:px-16 py-6 sm:py-8 lg:py-10 h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="mr-2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-900 to-red-900 text-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-3 mb-4 sm:mb-6 lg:mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-sm"></div>
              <Image
                src="/images/icon.png"
                alt="Bloom Journey Logo"
                width={40}
                height={40}
                className="relative rounded-full border-2 border-white w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
              />
            </div>
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold">Bloom Journey</span>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-pink-200 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto">
            Your complete pregnancy companion - from first plans to your child's third birthday.
          </p>
          <div className="flex justify-center space-x-4 sm:space-x-6 lg:space-x-8 text-xs sm:text-sm lg:text-base text-pink-300 mb-4 sm:mb-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
          <div className="mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-8 border-t border-pink-700">
            <p className="text-xs sm:text-sm lg:text-base text-pink-300">
              © 2024 Bloom Journey. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
