'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Share, MoreVertical, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showManualPrompt, setShowManualPrompt] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    // Detect device type and browser
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const ios = /iphone|ipad|ipod/i.test(userAgent);
      const android = /android/i.test(userAgent);
      
      setIsMobile(mobile);
      setIsIOS(ios);
      setIsAndroid(android);
      
      // For mobile devices, show manual prompt after a delay if no auto prompt appears
      if (mobile) {
        setTimeout(() => {
          if (!deferredPrompt && !isInstalled) {
            setShowManualPrompt(true);
          }
        }, 3000); // Show after 3 seconds on mobile
      }
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    const installed = checkIfInstalled();
    if (!installed) {
      detectDevice();
    }

    // Listen for beforeinstallprompt event (mainly for Android Chrome)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      setShowManualPrompt(false); // Hide manual prompt if auto prompt is available
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setShowManualPrompt(false);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Standard PWA installation for Android Chrome
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Error during installation:', error);
      }
    } else {
      // Manual installation instructions for iOS and other browsers
      setShowInstructionsModal(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowManualPrompt(false);
    setShowInstructionsModal(false);
    setDeferredPrompt(null);
    
    // Store dismissal in localStorage to avoid showing again soon
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return `To install Synergies4 on your iPhone/iPad:
1. Tap the Share button (⬆️) in Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to install the app
4. Find the Synergies4 app on your home screen`;
    } else if (isAndroid) {
      return `To install Synergies4 on your Android device:
1. Tap the menu (⋮) in your browser
2. Tap "Add to Home screen" or "Install app"
3. Tap "Add" or "Install"
4. Find the Synergies4 app in your app drawer`;
    } else {
      return `To install Synergies4:
1. Look for an install button in your browser's address bar
2. Or check your browser's menu for "Install app" option
3. Follow the prompts to install`;
    }
  };

  // Check if we should show prompt (considering previous dismissals)
  const shouldShowPrompt = () => {
    if (isInstalled) return false;
    
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) return false; // Don't show again for 24 hours
    }
    
    return (showInstallPrompt && deferredPrompt) || (showManualPrompt && isMobile);
  };

  // Don't show if conditions aren't met
  if (!shouldShowPrompt()) {
    return null;
  }

  const isManualPrompt = showManualPrompt && !deferredPrompt;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isManualPrompt ? 'Add to Home Screen' : 'Install Synergies4'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isManualPrompt 
                    ? 'Access your learning platform like a native app'
                    : 'Get quick access to your learning platform'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss install prompt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {isManualPrompt && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {isIOS && (
                  <>Tap the Share button <span className="font-mono">⬆️</span> below and select "Add to Home Screen"</>
                )}
                {isAndroid && (
                  <>Tap your browser menu <span className="font-mono">⋮</span> and select "Add to Home screen"</>
                )}
                {!isIOS && !isAndroid && (
                  <>Look for the install option in your browser menu or address bar</>
                )}
              </p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {isManualPrompt ? 'Show Instructions' : 'Install App'}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="px-4"
            >
              Later
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            • Works offline • Faster loading • Native app experience
            {isMobile && <span className="block mt-1">• Perfect for mobile learning on-the-go</span>}
          </div>
        </div>
      </div>

      {/* Installation Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Install Synergies4
              </h3>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {isIOS && (
                <>
                  <p className="text-gray-700">Follow these steps to add Synergies4 to your home screen:</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Share className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-800">1. Tap the Share button at the bottom of Safari</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-800">2. Scroll down and tap "Add to Home Screen"</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-800">3. Tap "Add" to install the app</span>
                    </div>
                  </div>
                </>
              )}
              
              {isAndroid && (
                <>
                  <p className="text-gray-700">Follow these steps to add Synergies4 to your home screen:</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-800">1. Tap the menu (⋮) in your browser</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Plus className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-800">2. Select "Add to Home screen" or "Install app"</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Download className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-800">3. Tap "Add" or "Install" to confirm</span>
                    </div>
                  </div>
                </>
              )}
              
              {!isIOS && !isAndroid && (
                <p className="text-gray-700">
                  Look for an install button in your browser's address bar or check your browser's menu for an "Install app" option.
                </p>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <Button
                onClick={() => setShowInstructionsModal(false)}
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 