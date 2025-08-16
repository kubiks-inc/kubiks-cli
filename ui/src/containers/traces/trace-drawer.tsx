'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Trace } from '@/types/trace';
import { Span } from '@/types/span';
import { SpansTab } from './spans-tab';

interface TraceDrawerProps {
  trace: Trace;
  isOpen: boolean;
  onClose: () => void;
  demoSpans?: Span[];
}

export const TraceDrawer = ({
  trace,
  isOpen,
  onClose,
  demoSpans,
}: TraceDrawerProps) => {
  const spans: Span[] = (demoSpans ?? []) as Span[];

  return (
    <Drawer
      open={isOpen}
      onOpenChange={onClose}
      direction="right"
      handleOnly={true}
    >
      <DrawerContent className="max-w-none !w-[90%] sm:!max-w-none">
        <div className="w-full h-screen flex flex-col">
          <DrawerHeader className="pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-muted-foreground">Trace ID:</span>
                  {trace.traceId}
                </DrawerTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="p-4 border-b flex-shrink-0" />
            <SpansTab trace={trace} spans={spans} />
          </div>

          <div className="border-t p-4 flex-shrink-0" />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
