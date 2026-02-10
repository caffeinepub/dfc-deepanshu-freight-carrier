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
    console.error('[AppErrorBoundary] Caught error:', error);
    console.error('[AppErrorBoundary] Error info:', errorInfo);
    
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
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">Something went wrong</CardTitle>
                  <CardDescription className="text-white/70">
                    An unexpected error occurred while rendering the application
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                <p className="text-white/90 font-medium mb-2">Error Message:</p>
                <p className="text-destructive text-sm font-mono">
                  {error?.message || 'Unknown error'}
                </p>
              </div>

              {errorInfo && (
                <div className="space-y-2">
                  <p className="text-white/90 font-medium">Error Details:</p>
                  <Textarea
                    readOnly
                    value={`${error?.stack || ''}\n\nComponent Stack:\n${errorInfo.componentStack || ''}`}
                    className="bg-neutral-950 border-neutral-800 text-white/70 font-mono text-xs min-h-[200px]"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRefresh}
                  className="flex-1 bg-gold hover:bg-gold/90 text-black font-bold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  onClick={this.handleCopyError}
                  variant="outline"
                  className="flex-1 border-neutral-700 text-white hover:bg-neutral-800"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Error Details
                </Button>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 mt-4">
                <p className="text-white/70 text-sm">
                  <strong className="text-white">What to do next:</strong>
                </p>
                <ul className="text-white/70 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>If the problem persists, copy the error details and contact support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
