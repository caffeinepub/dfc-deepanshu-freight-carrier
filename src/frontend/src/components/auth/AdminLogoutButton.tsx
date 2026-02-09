import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAdminSession } from '@/hooks/useAdminSession';

export function AdminLogoutButton() {
  const { logout } = useAdminSession();

  const handleLogout = async () => {
    await logout();
    
    // Scroll to home section
    const homeElement = document.getElementById('home');
    if (homeElement) {
      const headerOffset = 80;
      const elementPosition = homeElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}
