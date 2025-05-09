
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">NewsPortal</h3>
            <p className="text-gray-600">
              Your source for the latest news and articles across various categories.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-600 hover:text-primary transition-colors">
                  Admin
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-300 mt-8 pt-6 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} NewsPortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
