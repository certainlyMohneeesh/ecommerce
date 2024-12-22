import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link to="/" className="text-xl font-bold">
              EStore
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/products" className="hover:text-primary transition-colors">
                Products
              </Link>
              <Link to="/categories" className="hover:text-primary transition-colors">
                Categories
              </Link>
              <Link to="/deals" className="hover:text-primary transition-colors">
                Deals
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Input placeholder="Search products..." className="pr-10" />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Link to="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="hover:text-primary transition-colors">
              Products
            </Link>
            <Link to="/categories" className="hover:text-primary transition-colors">
              Categories
            </Link>
            <Link to="/deals" className="hover:text-primary transition-colors">
              Deals
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">About Us</h3>
              <p className="text-gray-600">Your trusted destination for quality products and excellent service.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-600 hover:text-primary">About</Link>
                <Link to="/contact" className="block text-gray-600 hover:text-primary">Contact</Link>
                <Link to="/faq" className="block text-gray-600 hover:text-primary">FAQ</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Customer Service</h3>
              <div className="space-y-2">
                <Link to="/shipping" className="block text-gray-600 hover:text-primary">Shipping Info</Link>
                <Link to="/returns" className="block text-gray-600 hover:text-primary">Returns</Link>
                <Link to="/terms" className="block text-gray-600 hover:text-primary">Terms & Conditions</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Newsletter</h3>
              <div className="space-y-4">
                <Input placeholder="Enter your email" />
                <Button className="w-full">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-600">
            <p>© 2024 EStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
