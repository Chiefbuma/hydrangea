
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

type LogoProps = {
  className?: string;
};

const Logo = ({ className }: LogoProps) => (
  <div className={cn("flex items-center justify-center bg-blue-600 rounded-lg p-1.5", className)}>
    <TrendingUp className="text-white h-full w-full" />
  </div>
);

export default Logo;
