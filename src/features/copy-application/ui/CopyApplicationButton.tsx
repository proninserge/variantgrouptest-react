import { type ReactElement, useEffect, useRef, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { CheckmarkIcon, CopyIcon, Icon } from '@/shared/ui/Icon';

type CopyApplicationButtonProps = {
  text: string;
  isLoading?: boolean;
};

const getButtonText = (copied: boolean, error: boolean) => {
  if (copied) return 'Copied!';
  if (error) return 'Error!';
  return 'Copy to clipboard';
};

export function CopyApplicationButton({
  text,
  isLoading = false,
}: CopyApplicationButtonProps): ReactElement {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        setError(false);
      }, 1000);
    } catch {
      setCopied(false);
      setError(true);
      timerRef.current = setTimeout(() => {
        setError(false);
      }, 1000);
    }
  };

  return (
    <Button
      variant="transparent"
      size="md"
      rightIcon={<Icon icon={copied ? CheckmarkIcon : CopyIcon} size="md" />}
      onClick={() => {
        void handleCopy();
      }}
      disabled={isLoading}
    >
      {getButtonText(copied, error)}
    </Button>
  );
}
