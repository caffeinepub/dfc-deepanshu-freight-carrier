import { useState, FormEvent } from 'react';
import { MessageCircle, Truck, Package, FileText, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminTrackingPanel } from '@/components/AdminTrackingPanel';
import { shipmentsStorage } from '@/lib/shipmentsStorage';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickup: '',
    drop: '',
    load: ''
  });

  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState('');

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

  const handleTrack = () => {
    const id = trackingId.toUpperCase();
    
    shipmentsStorage.initialize();
    const status = shipmentsStorage.get(id);
    
    if (status) {
      setTrackingResult(status);
    } else {
      setTrackingResult('❌ Invalid Tracking ID. Please Contact DFC Office.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gold/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/uploads/file_0000000002347209bc18a746d0cb6451.png" 
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
                onClick={() => scrollToSection('admin')}
                className="text-white hover:text-gold transition-colors font-medium"
              >
                Admin
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
                onClick={() => scrollToSection('services')}
                className="text-white hover:text-gold transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('track')}
                className="text-white hover:text-gold transition-colors"
              >
                Track
              </button>
              <button 
                onClick={() => scrollToSection('admin')}
                className="text-white hover:text-gold transition-colors"
              >
                Admin
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-white hover:text-gold transition-colors"
              >
                Contact
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
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
              />
              
              <Button 
                onClick={handleTrack}
                className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg"
              >
                Track Now
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

      {/* Admin Tracking Panel */}
      <AdminTrackingPanel />

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="text-5xl lg:text-6xl font-bold text-gold mb-3">500+</h3>
              <p className="text-white/80 text-lg">Happy Clients</p>
            </div>
            <div>
              <h3 className="text-5xl lg:text-6xl font-bold text-gold mb-3">10+</h3>
              <p className="text-white/80 text-lg">Years Experience</p>
            </div>
            <div>
              <h3 className="text-5xl lg:text-6xl font-bold text-gold mb-3">24/7</h3>
              <p className="text-white/80 text-lg">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-32 bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 text-center max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gold mb-8">
            About Deepanshu Freight Carrier
          </h2>
          <p className="text-white/90 text-lg leading-relaxed">
            Based in Steel Market, Kalamboli, Navi Mumbai,
            DFC provides secure, reliable and fast container transportation
            services across India with professional handling and competitive pricing.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gold text-center mb-16">
            Client Testimonials
          </h2>
          
          <Card className="bg-neutral-900 border-neutral-800 max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <p className="text-white/90 text-lg mb-6 italic">
                "Reliable transport partner for our steel shipments. Always on time!"
              </p>
              <p className="text-gold font-semibold">
                - Industrial Client, Mumbai
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-32 bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gold text-center mb-16">
            Get Instant Quote
          </h2>
          
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 mb-12">
            <Input
              type="text"
              placeholder="Your Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-white/50 h-12"
            />
            
            <Input
              type="tel"
              placeholder="Mobile Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-white/50 h-12"
            />
            
            <Input
              type="text"
              placeholder="Pickup Location"
              required
              value={formData.pickup}
              onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-white/50 h-12"
            />
            
            <Input
              type="text"
              placeholder="Drop Location"
              required
              value={formData.drop}
              onChange={(e) => setFormData({ ...formData, drop: e.target.value })}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-white/50 h-12"
            />
            
            <Textarea
              placeholder="Load Details"
              value={formData.load}
              onChange={(e) => setFormData({ ...formData, load: e.target.value })}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-white/50 min-h-32"
            />
            
            <Button 
              type="submit"
              className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg"
            >
              Send Quote Request
            </Button>
          </form>

          <div className="text-center space-y-4 text-white/90">
            <p className="flex items-center justify-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-gold" />
              258, Riddhi Arcade, Steel Market, Kalamboli, Navi Mumbai
            </p>
            <p className="flex items-center justify-center gap-2 text-base">
              <Phone className="w-5 h-5 text-gold" />
              9817783604 | 9817983604
            </p>
            <p className="flex items-center justify-center gap-2 text-base">
              <Mail className="w-5 h-5 text-gold" />
              deepanshufreightcarrier@gmail.com
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 border-t border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <p className="text-white/70">
            © 2026 Deepanshu Freight Carrier | All Rights Reserved
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919817783604"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20BA5A] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}

export default App;
