import { useRef, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { AttachmentData } from '../question-types/types';

interface AttachmentUploadProps {
  attachment: AttachmentData | null;
  onChange: (attachment: AttachmentData | null) => void;
  label?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

const DEFAULT_ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
];

const MAX_SIZE_MB = 5;

export function AttachmentUpload({
  attachment,
  onChange,
  label = 'Dosya Ekle',
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxSizeMB = MAX_SIZE_MB,
}: AttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!allowedTypes.includes(file.type)) {
      setError(`Geçersiz dosya tipi. İzin verilen: ${allowedTypes.join(', ')}`);
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır. Mevcut: ${fileSizeMB.toFixed(2)}MB`);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onChange({
        fileName: file.name,
        contentType: file.type,
        base64Content: base64,
      });
    } catch (err) {
      setError('Dosya yüklenirken bir hata oluştu');
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = attachment?.contentType.startsWith('image/');

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {!attachment ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {label}
          </Button>
        ) : (
          <div className="flex items-center gap-2 p-2 border rounded bg-slate-50">
            {isImage && (
              <img
                src={`data:${attachment.contentType};base64,${attachment.base64Content}`}
                alt={attachment.fileName}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {attachment.fileName}
              </p>
              <p className="text-xs text-slate-500">
                {(base64ToSize(attachment.base64Content) / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;

      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

function base64ToSize(base64: string): number {

  return (base64.length * 3) / 4;
}
