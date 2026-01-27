'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { useTextTemplatesByType } from '../hooks';
import { TextTemplateType } from '@/src/types';

const typeLabels: Record<TextTemplateType, string> = {
  Intro: 'Giriş Metni',
  Consent: 'Onay Metni',
  Outro: 'Teşekkür Metni',
};

interface TextTemplateSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TextTemplateType;
  onSelect: (content: string) => void;
}

export function TextTemplateSelectModal({
  open,
  onOpenChange,
  type,
  onSelect,
}: TextTemplateSelectModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: templates, isLoading } = useTextTemplatesByType(open ? type : null);

  const selectedTemplate = templates?.find((t) => t.id === selectedId);

  const handleApply = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate.content);
      onOpenChange(false);
      setSelectedId(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedId(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{typeLabels[type]} Şablonları</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          {/* Left pane - template list */}
          <div className="w-1/3 border rounded-lg overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Yükleniyor...</div>
            ) : !templates || templates.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                Bu tür için henüz şablon oluşturulmamış.
              </div>
            ) : (
              <div className="divide-y">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedId(template.id)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-accent ${
                      selectedId === template.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground'
                    }`}
                  >
                    {template.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right pane - content preview */}
          <div className="w-2/3 border rounded-lg overflow-y-auto p-4">
            {selectedTemplate ? (
              <div className="text-sm whitespace-pre-wrap text-foreground">
                {selectedTemplate.content}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
                Önizleme için sol taraftan bir şablon seçin
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            İptal
          </Button>
          <Button onClick={handleApply} disabled={!selectedTemplate}>
            Seç ve Uygula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
