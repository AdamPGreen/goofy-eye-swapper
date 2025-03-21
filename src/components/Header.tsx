
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-background/80 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          Eye Swapper
        </Link>

        <nav>
          <ul className="flex items-center space-x-6">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/my-swaps" className="hover:text-primary transition-colors">
                    My Swaps
                  </Link>
                </li>
                <li className="flex items-center space-x-2">
                  <Link to="/profile" className="flex items-center hover:text-primary transition-colors">
                    <UserCircle className="mr-1" size={20} />
                    <span className="max-w-[100px] truncate">{user.user_metadata.username || user.email}</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={signOut} 
                    className="text-muted-foreground"
                    aria-label="Sign out"
                  >
                    <LogOut size={18} />
                  </Button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/auth">
                  <Button size="sm" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
