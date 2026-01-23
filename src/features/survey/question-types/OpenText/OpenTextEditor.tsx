import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';
import { AttachmentUpload } from '../../components/AttachmentUpload';
import { QuestionEditorProps } from '../types';

export function OpenTextEditor({
  question,
  questionIndex,
  totalQuestions,
  onChange,
  onRemove,
  onReorder,
}: QuestionEditorProps) {
  return (
    <Card className="bg-white border-2">
      <CardHeader className="pb-3 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">
              Soru {questionIndex + 1}
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: '#0055a5', color: 'white' }}>
              Açık Uçlu
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
          <Label className="text-sm font-semibold text-slate-700 mb-2">Cevap Alanı Önizlemesi</Label>
          <Textarea
            placeholder="Kullanıcılar buraya cevaplarını yazacak..."
            disabled
            className="bg-slate-50 mt-2"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
