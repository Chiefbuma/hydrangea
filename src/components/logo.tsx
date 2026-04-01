import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

const Logo = ({ className }: LogoProps) => (
  <Image
    src="/images/hydrangea-logo.png"
    alt="Hydrangea Investments"
    width={720}
    height={180}
    priority
    className={cn('h-auto w-auto object-contain', className)}
  />
);

export default Logo;
