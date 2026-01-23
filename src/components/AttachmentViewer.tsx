import { useState } from 'react';
import { AttachmentMetadata } from '@/src/types';
import { FileText, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface AttachmentViewerProps {
  attachment: AttachmentMetadata;
  apiUrl: string;
  maxHeight?: string;
  className?: string;
}

export function AttachmentViewer({
  attachment,
  apiUrl,
  maxHeight = '400px',
  className = ''
}: AttachmentViewerProps) {
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const viewUrl = `${apiUrl}/Attachments/${attachment.id}`;

  const downloadUrl = `${apiUrl}/Attachments/${attachment.id}?download=true`;

  const isImage = attachment.contentType.startsWith('image/');
  const isPdf = attachment.contentType === 'application/pdf';

  if (isImage) {
    return (
      <div className={className}>
        <img
          src={viewUrl}
          alt={attachment.fileName}
          className="max-w-full h-auto rounded-lg border border-slate-200"
          style={{ maxHeight }}
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className={`border border-slate-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">{attachment.fileName}</span>
            <span className="text-xs text-slate-500">
              ({(attachment.sizeBytes / 1024).toFixed(1)} KB)
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowPdfPreview(!showPdfPreview)}
            >
              {showPdfPreview ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Gizle
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Önizle
                </>
              )}
            </Button>
            <a href={downloadUrl} download={attachment.fileName}>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                İndir
              </Button>
            </a>
          </div>
        </div>

        {}
        {showPdfPreview && (
          <div className="w-full border border-slate-300 rounded mt-3" style={{ height: maxHeight }}>
            <iframe
              src={viewUrl}
              title={attachment.fileName}
              width="100%"
              height="100%"
              className="rounded"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`border border-slate-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-medium">{attachment.fileName}</span>
        </div>
        <a href={downloadUrl} download={attachment.fileName}>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            İndir
          </Button>
        </a>
      </div>
    </div>
  );
}
