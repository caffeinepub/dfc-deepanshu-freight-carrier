import { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log errors once, avoid repeated console spam
    if (!this.state.hasError) {
      console.error('[AppErrorBoundary] Error caught:', error.message);
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `Error: ${error?.message || 'Unknown error'}\n\nStack: ${error?.stack || 'No stack trace'}\n\nComponent Stack: ${errorInfo?.componentStack || 'No component stack'}`;
    
    navigator.clipboard.writeText(errorText).then(() => {
      toast.success('Error details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy error details');
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <Card className="bg-neutral-900 border-neutral-800 max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-gold text-2xl">Something went wrong</CardTitle>
                  <CardDescription className="text-white/70">
                    An unexpected error occurred in the application
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">Error Message:</label>
                <Textarea
                  value={error?.message || 'Unknown error'}
                  readOnly
                  className="bg-neutral-950 border-neutral-700 text-red-400 font-mono text-sm min-h-[80px]"
                />
              </div>

              {errorInfo?.componentStack && (
                <div className="space-y-2">
                  <label className="text-white font-medium text-sm">Component Stack:</label>
                  <Textarea
                    value={errorInfo.componentStack}
                    readOnly
                    className="bg-neutral-950 border-neutral-700 text-white/70 font-mono text-xs min-h-[120px]"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={this.handleRefresh}
                  className="flex-1 bg-gold hover:bg-gold/90 text-black font-semibold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  onClick={this.handleCopyError}
                  variant="outline"
                  className="border-neutral-700 bg-neutral-950 text-white hover:bg-neutral-800 hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Error
                </Button>
              </div>

              <p className="text-white/50 text-sm text-center pt-2">
                If this problem persists, please contact support with the error details.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
