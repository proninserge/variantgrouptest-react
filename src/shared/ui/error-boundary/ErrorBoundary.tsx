import { Component, type ErrorInfo, type ReactNode } from 'react';

import { centeredPageStyles as styles } from '@/shared/ui/centered-page';

import { Button } from '../button';
import { VStack } from '../stack';
import { Typography } from '../typography';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

const initialState: State = { error: null };

export class ErrorBoundary extends Component<Props, State> {
  state = initialState;

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState(initialState);
  };

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (typeof fallback === 'function') return fallback(error, this.reset);
      if (fallback) return fallback;
      return <DefaultFallback error={error} reset={this.reset} />;
    }

    return children;
  }
}

export function DefaultFallback({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <VStack role="alert" align="center" justify="center" fullWidth className={styles.root}>
      <VStack align="center" gap="md" className={styles.content}>
        <Typography variant="h1" color="text-primary" weight="semibold">
          Oops! 🚒
        </Typography>
        <Typography variant="h2" color="text-primary" weight="semibold">
          Our engineers are already on the scene.
        </Typography>
        <Typography variant="sm" color="error">
          {error.message}
        </Typography>
        {reset && (
          <Button size="lg" onClick={reset}>
            Make it work!
          </Button>
        )}
      </VStack>
    </VStack>
  );
}
