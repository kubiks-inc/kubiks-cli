import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
}

export const CopyButton = ({
  text,
  className,
  buttonClassName,
  iconClassName,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={className}>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        className={cn(
          'h-6 w-6 text-muted-foreground hover:text-foreground',
          buttonClassName
        )}
      >
        {copied ? (
          <Check className={cn('h-4 w-4', iconClassName)} />
        ) : (
          <Copy className={cn('h-4 w-4', iconClassName)} />
        )}
      </Button>
    </div>
  );
};

export default CopyButton;
