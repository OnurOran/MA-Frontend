import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { AttachmentUpload } from '../../components/AttachmentUpload';
import { QuestionEditorProps } from '../types';

const AVAILABLE_CONTENT_TYPES = [
  { value: 'image/png', label: 'PNG Images' },
  { value: 'image/jpeg', label: 'JPEG Images' },
  { value: 'image/jpg', label: 'JPG Images' },
  { value: 'image/webp', label: 'WebP Images' },
  { value: 'application/pdf', label: 'PDF Documents' },
  { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word Documents (DOCX)' },
  { value: 'application/msword', label: 'Word Documents (DOC)' },
  { value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel Spreadsheets (XLSX)' },
  { value: 'application/vnd.ms-excel', label: 'Excel Spreadsheets (XLS)' },
  { value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', label: 'PowerPoint Presentations (PPTX)' },
  { value: 'application/vnd.ms-powerpoint', label: 'PowerPoint Presentations (PPT)' },
];

export function FileUploadEditor({
  question,
  questionIndex,
  totalQuestions,
  onChange,
  onRemove,
  onReorder,
}: QuestionEditorProps) {
  const allowedTypes = question.allowedAttachmentContentTypes || [];

  const toggleContentType = (contentType: string) => {
    const current = allowedTypes;
    const updated = current.includes(contentType)
      ? current.filter((t) => t !== contentType)
      : [...current, contentType];

    onChange({
      ...question,
      allowedAttachmentContentTypes: updated.length > 0 ? updated : undefined,
    });
  };

  return (
    <Card className="bg-white border-2">
      <CardHeader className="pb-3 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">
              Soru {questionIndex + 1}
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: '#0055a5', color: 'white' }}>
              Dosya Yükleme
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={String(questionIndex + 1)}
              onValueChange={(value) => onReorder(parseInt(value) - 1)}
            >
              <SelectTrigger className="w-24 h-9 text-sm bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Array.from({ length: totalQuestions }, (_, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    Sıra {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-white hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div>
          <Label className="font-semibold">Soru Metni *</Label>
          <Input
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            placeholder="Soru metnini girin..."
            className="mt-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={question.isRequired}
            onCheckedChange={(checked) => onChange({ ...question, isRequired: checked === true })}
          />
          <Label className="cursor-pointer font-medium">Zorunlu soru</Label>
        </div>

        <div>
          <Label className="text-sm font-semibold text-slate-700">Soru Eki (Opsiyonel)</Label>
          <AttachmentUpload
            attachment={question.attachment}
            onChange={(attachment) => onChange({ ...question, attachment })}
            label="Dosya Ekle"
          />
        </div>

        <div className="border-t pt-4">
          <Label className="mb-3 block font-semibold">
            İzin Verilen Dosya Tipleri
            <span className="text-xs text-slate-500 font-normal ml-2">(Boş bırakılırsa tüm tipler kabul edilir)</span>
          </Label>
          <div className="space-y-2">
            {AVAILABLE_CONTENT_TYPES.map((type) => (
              <div key={type.value} className="flex items-center gap-2">
                <Checkbox
                  checked={allowedTypes.includes(type.value)}
                  onCheckedChange={() => toggleContentType(type.value)}
                />
                <Label className="cursor-pointer text-sm font-normal">{type.label}</Label>
              </div>
            ))}
          </div>

          {allowedTypes.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs" style={{ color: '#0055a5' }}>
              <strong>Seçili tipler:</strong> {allowedTypes.join(', ')}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-slate-700 mb-2">Cevap Alanı Önizlemesi</Label>
          <div className="border-2 border-dashed border-slate-300 rounded p-6 text-center bg-slate-50 mt-2">
            <svg className="w-10 h-10 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-slate-600">Kullanıcılar buraya dosya yükleyecek</p>
            <p className="text-xs text-slate-500 mt-1">Maksimum 5 MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
