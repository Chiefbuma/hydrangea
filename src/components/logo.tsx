import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

const Logo = ({ className }: LogoProps) => (
  <img
    src="/images/hydrangea-logo.png"
    alt="Hydrangea Investments"
    className={cn('h-auto w-auto object-contain', className)}
    loading="eager"
    decoding="async"
  />
);

export default Logo;
