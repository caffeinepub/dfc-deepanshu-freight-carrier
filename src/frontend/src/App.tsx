import { useState, FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessageCircle, Truck, Package, FileText, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { AdminLoginCard } from '@/components/auth/AdminLoginCard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ClientPortalLoginCard } from '@/components/client/ClientPortalLoginCard';
import { ClientDashboard } from '@/components/client/ClientDashboard';
import { ClientPasswordChangeCard } from '@/components/client/ClientPasswordChangeCard';
import { useAdminSession } from './hooks/useAdminSession';
import { useClientSession } from './hooks/useClientSession';
import { useGetClientAccountStatus } from './hooks/useQueries';
import { useActor } from './hooks/useActor';

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated: isAdminAuthenticated, isValidating: isAdminValidating } = useAdminSession();
  const { isAuthenticated: isClientAuthenticated } = useClientSession();
  const { data: clientAccountStatus, isLoading: isLoadingClientStatus, isFetched: isClientStatusFetched } = useGetClientAccountStatus();
  const { actor } = useActor();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickup: '',
    drop: '',
    load: ''
  });

  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const message = `New Quote Request:%0AName: ${formData.name}%0APhone: ${formData.phone}%0APickup: ${formData.pickup}%0ADrop: ${formData.drop}%0ALoad: ${formData.load}`;
    
    window.open(`https://wa.me/919817783604?text=${message}`, '_blank');
  };

  const handleTrack = async () => {
    const id = trackingId.toUpperCase().trim();
    
    if (!id) {
      setTrackingResult('❌ Please enter a tracking ID.');
      return;
    }

    setIsTracking(true);
    setTrackingResult('');

    try {
      if (!actor) {
        setTrackingResult('❌ Service temporarily unavailable. Please try again.');
        return;
      }

      const shipment = await actor.trackShipment(id);
      
      if (shipment) {
        setTrackingResult(shipment.status);
      } else {
        setTrackingResult('❌ Invalid Tracking ID. Please contact DFC office.');
      }
    } catch (error) {
      console.error('Tracking error:', error);
      setTrackingResult('❌ Error tracking shipment. Please try again.');
    } finally {
      setIsTracking(false);
    }
  };

  // Determine what to show in Client Portal section
  const renderClientPortalContent = () => {
    if (!isClientAuthenticated) {
      return <ClientPortalLoginCard />;
    }

    // Show loading state while fetching account status
    if (isLoadingClientStatus || !isClientStatusFetched) {
      return (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Skeleton className="h-8 w-48 bg-neutral-800" />
            </div>
          </CardContent>
        </Card>
      );
    }

    // Show password change if first login
    if (clientAccountStatus?.isFirstLogin) {
      return <ClientPasswordChangeCard onSuccess={() => {
        // The query will automatically refetch and show dashboard
      }} />;
    }

    // Show dashboard for regular users
    return <ClientDashboard />;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gold/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/file_0000000002347209bc18a746d0cb6451.png" 
                alt="DFC Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-white hover:text-gold transition-colors font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-white hover:text-gold transition-colors font-medium"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('track')}
                className="text-white hover:text-gold transition-colors font-medium"
              >
                Track
              </button>
              <button 
                onClick={() => scrollToSection('client-portal')}
                className="text-white hover:text-gold transition-colors font-medium"
              >
                Client Portal
              </button>
              <button 
                onClick={() => scrollToSection('dashboard')}
                className="text-white hover:text-gold transition-colors font-medium"
              >
                Dashboard
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-white hover:text-gold transition-colors font-medium"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-white hover:text-gold transition-colors font-medium"
              >
                Contact
              </button>
            </nav>

            {/* Mobile Menu */}
            <nav className="flex md:hidden items-center gap-4 text-sm">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-white hover:text-gold transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('track')}
                className="text-white hover:text-gold transition-colors"
              >
                Track
              </button>
              <button 
                onClick={() => scrollToSection('client-portal')}
                className="text-white hover:text-gold transition-colors"
              >
                Portal
              </button>
              <button 
                onClick={() => scrollToSection('dashboard')}
                className="text-white hover:text-gold transition-colors"
              >
                Admin
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="home" 
        className="relative min-h-screen flex items-center justify-center pt-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1601582589907-f92af5ed9db8)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gold mb-6">
            India's Trusted Container Transport Company
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mb-8">
            32 Feet | MXL | SXL Container Specialists
          </p>
          <Button 
            onClick={() => scrollToSection('contact')}
            className="bg-gold hover:bg-gold/90 text-black font-bold text-lg px-8 py-6 rounded-lg transition-all hover:scale-105"
          >
            Get Instant Quote
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-32 bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gold text-center mb-16">
            Our Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-gold" />
                </div>
                <CardTitle className="text-gold text-xl">Container Transport</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/80 text-base">
                  32 Feet, MXL & SXL Container Transportation Across India.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-gold" />
                </div>
                <CardTitle className="text-gold text-xl">Industrial & Steel Transport</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/80 text-base">
                  Steel Coils, Pipes, Machinery & Heavy Material Handling.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-gold" />
                </div>
                <CardTitle className="text-gold text-xl">Dedicated Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/80 text-base">
                  Monthly & Yearly Contract Services with Dedicated Trucks.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Track Shipment Section */}
      <section id="track" className="py-20 lg:py-32 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gold text-center mb-16">
            Track Your Shipment
          </h2>
          
          <Card className="bg-neutral-900 border-neutral-800 max-w-xl mx-auto">
            <CardContent className="pt-8 space-y-6">
              <Input
                type="text"
                placeholder="Enter Tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
              />
              
              <Button 
                onClick={handleTrack}
                disabled={isTracking}
                className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg"
              >
                {isTracking ? 'Tracking...' : 'Track Now'}
              </Button>
              
              {trackingResult && (
                <div className="text-center">
                  <h3 className="text-xl text-white font-semibold">
                    {trackingResult}
                  </h3>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Client Portal Section */}
      <section id="client-portal" className="py-20 lg:py-32 bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gold text-center mb-8">
            Client Portal
          </h2>
          <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
            Access your shipment history, invoices, and account details through our secure client portal.
          </p>
          {renderClientPortalContent()}
        </div>
      </section>

      {/* Admin Dashboard Section */}
      <section id="dashboard" className="py-20 lg:py-32 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gold text-center mb-8">
            Admin Dashboard
          </h2>
          <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
            Manage clients, shipments, invoices, and system configuration.
          </p>
          {isAdminAuthenticated ? (
            <AdminDashboard />
          ) : (
            <AdminLoginCard />
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-32 bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gold text-center mb-16">
            About DFC
          </h2>
          
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-white/90 text-lg leading-relaxed">
              DFC is India's premier container transport company, specializing in 32 Feet, MXL, and SXL container transportation. With years of experience and a commitment to excellence, we ensure your cargo reaches its destination safely and on time.
            </p>
            <p className="text-white/90 text-lg leading-relaxed">
              Our fleet of modern trucks and experienced drivers handle everything from industrial materials to steel products, providing reliable service across India.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-32 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gold text-center mb-16">
            Get In Touch
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-gold text-2xl">Request a Quote</CardTitle>
                <CardDescription className="text-white/70">
                  Fill out the form and we'll get back to you shortly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
                  />
                  <Input
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
                  />
                  <Input
                    placeholder="Pickup Location"
                    value={formData.pickup}
                    onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
                  />
                  <Input
                    placeholder="Drop Location"
                    value={formData.drop}
                    onChange={(e) => setFormData({ ...formData, drop: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
                  />
                  <Textarea
                    placeholder="Load Details"
                    value={formData.load}
                    onChange={(e) => setFormData({ ...formData, load: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 min-h-[100px]"
                  />
                  <Button 
                    type="submit"
                    className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send via WhatsApp
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-gold font-semibold text-lg mb-2">Phone</h3>
                      <p className="text-white/80">+91 98177 83604</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-gold font-semibold text-lg mb-2">Email</h3>
                      <p className="text-white/80">contact@dfc.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-gold font-semibold text-lg mb-2">Office</h3>
                      <p className="text-white/80">India</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center text-white/60">
            <p className="mb-2">
              © {new Date().getFullYear()} DFC. All rights reserved.
            </p>
            <p className="text-sm">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'dfc-app'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold/80 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
