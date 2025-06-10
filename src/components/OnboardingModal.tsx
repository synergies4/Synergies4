'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Sparkles, X, User, Settings, Brain } from 'lucide-react';
import OnboardingQuestionnaire from './OnboardingQuestionnaire';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

export default function OnboardingModal({ isOpen, onComplete, onDismiss }: OnboardingModalProps) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const handleStartOnboarding = () => {
    setShowQuestionnaire(true);
  };

  const handleCompleteOnboarding = () => {
    setShowQuestionnaire(false);
    onComplete();
  };

  const handleClose = () => {
    setShowQuestionnaire(false);
    onDismiss();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl">
        {!showQuestionnaire ? (
          <>
            <DialogHeader className="pb-6 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Personalize Your AI Experience
              </DialogTitle>
              <p className="text-gray-600 mt-2">
                Help us understand your role and goals so we can provide the most relevant coaching and support.
              </p>
            </DialogHeader>

            <div className="space-y-6">
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">Role-Specific Advice</h3>
                    <p className="text-sm text-gray-600">Get guidance tailored to your specific job role and responsibilities</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">Smart Coaching</h3>
                    <p className="text-sm text-gray-600">AI responses based on your learning style and preferences</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">Adaptive Experience</h3>
                    <p className="text-sm text-gray-600">Content and coaching adapted to your current challenges</p>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="space-y-4">
                <Button
                  onClick={handleStartOnboarding}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Personalization (2 minutes)
                </Button>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Maybe later
                  </Button>
                  <div className="text-xs text-gray-500">
                    You can always personalize later in your profile settings
                  </div>
                </div>
              </div>

              {/* Privacy note */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">
                  🔒 Your information is private and secure. We only use it to personalize your AI experience.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="relative">
            {/* Close button for questionnaire */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-0 right-0 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <OnboardingQuestionnaire onComplete={handleCompleteOnboarding} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 