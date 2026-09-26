"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { AlertCircle, MapPin, Phone, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyButtonProps {
  onEmergency: (message: string) => void;
  sending?: boolean;
}

export function EmergencyButton({ onEmergency, sending }: EmergencyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Emergency! Please assist immediately.");

  const handleSend = () => {
    onEmergency(message);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="danger"
        size="xl"
        className={cn(
          "w-full font-bold text-lg py-6 shadow-xl hover:shadow-2xl",
          "bg-emergency hover:bg-emergency/90 border-2 border-emergency",
          "animate-pulse-slow-hover"
        )}
        onClick={() => setIsOpen(true)}
      >
        <AlertCircle className="h-6 w-6 mr-2" />
        EMERGENCY
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Send Emergency Alert"
        description="This will immediately notify the school administrator and all parents on this bus."
        size="md"
      >
        <div className="space-y-4">
          <Card className="border-emergency/30 bg-emergency/5">
            <CardContent className="p-4">
              <CardTitle className="text-emergency flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Confirm Emergency Alert
              </CardTitle>
              <p className="text-sm text-secondary mt-2">
                This alert will be sent to:
              </p>
              <ul className="text-sm text-secondary mt-2 space-y-1">
                <li>• School Administrator</li>
                <li>• All parents on this bus</li>
                <li>• Fleet monitoring center</li>
              </ul>
            </CardContent>
          </Card>

          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Message
            </label>
            <textarea
              className="w-full rounded-xl border border-border/30 bg-card px-4 py-2.5 text-sm text-primary placeholder:text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the emergency..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            className="flex-1 font-bold"
            loading={sending}
            onClick={handleSend}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Send Alert
          </Button>
        </div>
      </Modal>
    </>
  );
}
