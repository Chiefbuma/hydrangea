
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

const Logo = ({ className }: LogoProps) => (
  <div className={cn("flex items-center justify-center bg-blue-600 rounded-lg p-1.5 overflow-hidden", className)}>
    <img 
      src="/images/hydrangea-logo.png" 
      alt="BlueOak Logo" 
      className="h-full w-full object-contain"
      onError={(e) => {
        // Fallback if image fails to load
        e.currentTarget.style.display = 'none';
      }}
    />
  </div>
);

export default Logo;
