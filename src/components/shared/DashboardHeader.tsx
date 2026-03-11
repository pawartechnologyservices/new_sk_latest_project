import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export const DashboardHeader = ({ title, subtitle, onMenuClick }: DashboardHeaderProps) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card border-b border-border px-4 md:px-6 py-4 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu for Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
};