'use client';

import { useState, useEffect } from 'react';
import { Baby, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BabyVoiceProps {
  week: number;
  day?: number;
  className?: string;
}

export function BabyVoice({ week, day = 1, className = "" }: BabyVoiceProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState("");

  const babyMessages = {
    15: "Du kannst jetzt beginnen, mir deine Lieblingsmusik vorzuspielen oder Lieder vorzusingen. Und ich würde sehr gerne auch Papis Stimme hören! Seine Stimme beruhigt mich so schön! :) Sag ihm 'Hallo' von mir und bitte ihn, mir ein paar Süßigkeiten aufzuheben.",
    16: "Ich wachse so schnell! Meine Knochen werden härter und ich kann jetzt schon meine Finger bewegen. Manchmal spüre ich, wenn du dich bewegst - das ist so aufregend!",
    17: "Meine Augen können jetzt Licht wahrnehmen! Wenn du eine Taschenlampe auf deinen Bauch richtest, kann ich das Licht sehen. Das ist so cool!",
    18: "Ich kann jetzt schon hören! Deine Stimme ist so beruhigend. Sprich mit mir, sing mir Lieder vor - ich liebe es, deine Stimme zu hören!",
    19: "Ich bin jetzt so groß wie eine Mango! Meine Haut wird dicker und ich bekomme kleine Haare. Ich kann auch schon schlucken und atmen üben.",
    20: "Halbzeit! Ich bin jetzt in der Mitte meiner Reise. Meine Organe sind fast vollständig entwickelt und ich kann jetzt schon träumen!",
    21: "Ich bin jetzt so groß wie eine Banane! Meine Bewegungen werden koordinierter und ich kann jetzt schon greifen. Das ist so aufregend!",
    22: "Meine Augenlider sind jetzt vollständig entwickelt! Ich kann meine Augen öffnen und schließen. Manchmal schaue ich sogar in deine Richtung!",
    23: "Ich bin jetzt so groß wie eine Grapefruit! Meine Lungen entwickeln sich weiter und ich übe das Atmen. Bald kann ich dich sehen!",
    24: "Meine Fingerabdrücke sind jetzt vollständig! Jeder Finger ist einzigartig, genau wie ich. Ich kann jetzt auch schon schmecken!",
    25: "Ich bin jetzt so groß wie eine Aubergine! Meine Haut wird rosiger und ich bekomme mehr Haare. Ich kann jetzt auch schon träumen!"
  };

  useEffect(() => {
    const weekMessage = babyMessages[week as keyof typeof babyMessages] || babyMessages[15];
    setMessage(weekMessage);
  }, [week]);

  const handlePlayVoice = () => {
    setIsPlaying(true);
    // Here you could add actual audio playback functionality
    setTimeout(() => setIsPlaying(false), 3000);
  };

  if (!isVisible) return null;

  return (
    <Card className={`bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200 shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
            <Baby className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-pink-800">Baby's Voice</h3>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePlayVoice}
                  disabled={isPlaying}
                  className="w-8 h-8 p-0 bg-pink-200 hover:bg-pink-300"
                >
                  {isPlaying ? (
                    <VolumeX className="w-4 h-4 text-pink-600" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-pink-600" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                  className="w-8 h-8 p-0 bg-pink-200 hover:bg-pink-300"
                >
                  ×
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {message}
            </p>
            <div className="mt-2 text-xs text-pink-600">
              Week {week}, Day {day}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 