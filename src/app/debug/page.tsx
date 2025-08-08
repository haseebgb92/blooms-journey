'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const runDebug = async () => {
    setIsLoading(true);
    try {
      // Simple debug check
      const user = auth.currentUser;
      setDebugInfo({
        isConnected: !!auth && !!firestore,
        isAuthenticated: !!user,
        user: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        } : null,
        error: null
      });
    } catch (error: any) {
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug Page</h1>
        <p className="text-muted-foreground">
          Use this page to debug issues with the application.
        </p>
      </div>

      <div className="grid gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
            <CardDescription>
              Run these tests to check application status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={runDebug} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Running...' : 'Run Debug Test'}
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="destructive"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Results</CardTitle>
              <CardDescription>
                Current application status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Connection Status</h4>
                  <Badge variant={debugInfo.isConnected ? "default" : "destructive"}>
                    {debugInfo.isConnected ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Authentication</h4>
                  <Badge variant={debugInfo.isAuthenticated ? "default" : "destructive"}>
                    {debugInfo.isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </Badge>
                </div>
              </div>

              {debugInfo.user && (
                <div>
                  <h4 className="font-semibold mb-2">User Information</h4>
                  <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                    <div><strong>UID:</strong> {debugInfo.user.uid}</div>
                    <div><strong>Email:</strong> {debugInfo.user.email}</div>
                    <div><strong>Display Name:</strong> {debugInfo.user.displayName || 'Not set'}</div>
                  </div>
                </div>
              )}

              {debugInfo.error && (
                <div>
                  <h4 className="font-semibold mb-2 text-destructive">Error</h4>
                  <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
                    {debugInfo.error}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common Solutions</CardTitle>
          <CardDescription>
            Try these steps if you're experiencing issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Check Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Make sure you're properly logged in. Try logging out and back in.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">2. Check Console Logs</h4>
            <p className="text-sm text-muted-foreground">
              Open browser developer tools and check the console for detailed error messages.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">3. Verify Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Ensure your configuration is correct and the project is properly set up.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 