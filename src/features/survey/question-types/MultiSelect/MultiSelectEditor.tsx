import { useEffect } from 'react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { AttachmentUpload } from '../../components/AttachmentUpload';
import { QuestionEditorProps } from '../types';

export function MultiSelectEditor({
  question,
  questionIndex,
  totalQuestions,
  onChange,
  onRemove,
  onReorder,
}: QuestionEditorProps) {
  useEffect(() => {
    if (question.options.length >= 2) {
      return;
    }
    const padded = [
      ...question.options.map((opt, idx) => ({ ...opt, order: idx + 1 })),
      ...Array.from({ length: 2 - question.options.length }, (_, idx) => {
        const order = question.options.length + idx + 1;
        return { text: '', order, value: 0, attachment: null };
      }),
    ];
    onChange({ ...question, options: padded });
  }, [onChange, question]);

  const addOption = () => {
    if (question.options.length >= 10) return;
    onChange({
      ...question,
      options: [
        ...question.options,
        {
          text: '',
          order: question.options.length + 1,
          value: 0,
          attachment: null,
        },
      ],
    });
  };

  const removeOption = (optionIndex: number) => {
    const updated = question.options.filter((_, i) => i !== optionIndex);

    updated.forEach((opt, i) => {
      opt.order = i + 1;
    });
    onChange({ ...question, options: updated });
  };

  const updateOption = (optionIndex: number, field: 'text' | 'value' | 'attachment', value: any) => {
    const updated = [...question.options];
    updated[optionIndex] = { ...updated[optionIndex], [field]: value };
    onChange({ ...question, options: updated });
  };

  const reorderOption = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const updated = [...question.options];
    const [movedOption] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedOption);

    updated.forEach((opt, i) => {
      opt.order = i + 1;
    });

    onChange({ ...question, options: updated });
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
              Çoklu Seçim
            </span>
          </div>

          <div className="flex items-center gap-2">
            {}
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

            {}
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
        {}
        <div>
          <Label className="font-semibold">Soru Metni *</Label>
          <Input
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            placeholder="Soru metnini girin..."
            className="mt-1"
          />
        </div>

        {}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={question.isRequired}
            onCheckedChange={(checked) => onChange({ ...question, isRequired: checked === true })}
          />
          <Label className="cursor-pointer font-medium">Zorunlu soru</Label>
        </div>

        {}
        <div>
          <Label className="text-sm font-semibold text-slate-700">Soru Eki (Opsiyonel)</Label>
          <AttachmentUpload
            attachment={question.attachment}
            onChange={(attachment) => onChange({ ...question, attachment })}
            label="Dosya Ekle"
          />
        </div>

        {}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="font-semibold">Seçenekler *</Label>
            <Button
              type="button"
              size="sm"
              onClick={addOption}
              style={{ backgroundColor: '#0055a5' }}
              className="hover:opacity-90 disabled:opacity-50"
              disabled={question.options.length >= 10}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Seçenek Ekle
            </Button>
          </div>

          {question.options.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">Henüz seçenek eklenmedi</p>
          ) : (
            <div className="space-y-3">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="p-3 border rounded bg-white space-y-2">
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center w-8 h-9 bg-slate-50 border rounded">
                      <div className="w-3 h-3 border-2 border-slate-400 rounded-sm" />
                    </div>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(oIndex, 'text', e.target.value)}
                      placeholder={`Seçenek ${oIndex + 1}`}
                      className="flex-1"
                    />
                    {}
                    <Select
                      value={String(oIndex + 1)}
                      onValueChange={(value) => reorderOption(oIndex, parseInt(value) - 1)}
                    >
                      <SelectTrigger className="w-20 h-9 text-sm bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {Array.from({ length: question.options.length }, (_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(oIndex)}
                  className="text-red-600 hover:text-white hover:bg-red-600 disabled:opacity-50"
                  disabled={question.options.length <= 2}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
                  </div>

                  {}
                  <div className="pl-10">
                    <AttachmentUpload
                      attachment={option.attachment}
                      onChange={(attachment) => updateOption(oIndex, 'attachment', attachment)}
                      label="Dosya Ekle"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
