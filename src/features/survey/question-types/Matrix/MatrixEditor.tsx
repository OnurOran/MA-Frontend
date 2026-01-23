import { useEffect } from 'react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { AttachmentUpload } from '../../components/AttachmentUpload';
import { QuestionEditorProps } from '../types';

const DEFAULT_SCALE_LABELS = [
  'Hiç Katılmıyorum',
  'Katılmıyorum',
  'Kararsızım',
  'Katılıyorum',
  'Kesinlikle Katılıyorum'
];

export function MatrixEditor({
  question,
  questionIndex,
  totalQuestions,
  onChange,
  onRemove,
  onReorder,
}: QuestionEditorProps) {
  // Initialize with default values
  useEffect(() => {
    let updated = false;
    let newQuestion = { ...question };

    // Initialize scale labels if not present
    if (!question.matrixScaleLabels || question.matrixScaleLabels.length !== 5) {
      newQuestion.matrixScaleLabels = [...DEFAULT_SCALE_LABELS];
      updated = true;
    }

    // Ensure at least 2 options (rows)
    if (question.options.length < 2) {
      const padded = [
        ...question.options.map((opt, idx) => ({ ...opt, order: idx + 1 })),
        ...Array.from({ length: 2 - question.options.length }, (_, idx) => {
          const order = question.options.length + idx + 1;
          return { text: '', order, value: 0, attachment: null };
        }),
      ];
      newQuestion.options = padded;
      updated = true;
    }

    if (updated) {
      onChange(newQuestion);
    }
  }, []);

  const addOption = () => {
    if (question.options.length >= 20) return;
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
    if (question.options.length <= 2) return;
    const updated = question.options.filter((_, i) => i !== optionIndex);
    updated.forEach((opt, i) => {
      opt.order = i + 1;
    });
    onChange({ ...question, options: updated });
  };

  const updateOption = (optionIndex: number, text: string) => {
    const updated = [...question.options];
    updated[optionIndex] = { ...updated[optionIndex], text };
    onChange({ ...question, options: updated });
  };

  const updateScaleLabel = (index: number, label: string) => {
    const labels = [...(question.matrixScaleLabels || DEFAULT_SCALE_LABELS)];
    labels[index] = label;
    onChange({ ...question, matrixScaleLabels: labels });
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
            <span className="px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: '#7c3aed', color: 'white' }}>
              Matrix / Likert
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
        {/* Question Text */}
        <div>
          <Label className="font-semibold">Soru Metni *</Label>
          <Input
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            placeholder="Örn: Aşağıdaki değer setlerine göre değerlendirir misiniz?"
            className="mt-1"
          />
        </div>

        {/* Required Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={question.isRequired}
            onCheckedChange={(checked) => onChange({ ...question, isRequired: checked === true })}
          />
          <Label className="cursor-pointer font-medium">Zorunlu soru</Label>
        </div>

        {/* Question Attachment */}
        <div>
          <Label className="text-sm font-semibold text-slate-700">Soru Eki (Opsiyonel)</Label>
          <AttachmentUpload
            attachment={question.attachment}
            onChange={(attachment) => onChange({ ...question, attachment })}
            label="Dosya Ekle"
          />
        </div>

        {/* Scale Labels */}
        <div className="border-t pt-4 mt-4">
          <Label className="font-semibold mb-3 block">Ölçek Etiketleri (1-5) *</Label>
          <div className="grid grid-cols-5 gap-2">
            {(question.matrixScaleLabels || DEFAULT_SCALE_LABELS).map((label, index) => (
              <div key={index} className="space-y-1">
                <Label className="text-xs text-slate-500">{index + 1}</Label>
                <Input
                  value={label}
                  onChange={(e) => updateScaleLabel(index, e.target.value)}
                  placeholder={DEFAULT_SCALE_LABELS[index]}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Matrix Items (Rows) */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="font-semibold">Değerlendirme Maddeleri (Satırlar) *</Label>
            <Button
              type="button"
              size="sm"
              onClick={addOption}
              style={{ backgroundColor: '#7c3aed' }}
              className="hover:opacity-90 disabled:opacity-50"
              disabled={question.options.length >= 20}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Madde Ekle
            </Button>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Her satır için kullanıcı 1-5 arasında bir değer seçecek.
          </p>

          {question.options.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">Henüz madde eklenmedi</p>
          ) : (
            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex gap-2 items-center">
                  <div className="flex items-center justify-center w-8 h-9 bg-slate-100 border rounded text-sm font-medium text-slate-600">
                    {oIndex + 1}
                  </div>
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(oIndex, e.target.value)}
                    placeholder={`Madde ${oIndex + 1} (örn: Adil ve Güvenilir)`}
                    className="flex-1"
                  />
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
              ))}
            </div>
          )}
        </div>

        {/* Explanation Settings */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              checked={question.matrixShowExplanation || false}
              onCheckedChange={(checked) => onChange({ ...question, matrixShowExplanation: checked === true })}
            />
            <Label className="cursor-pointer font-medium">
              Düşük puanlarda (1-2) açıklama iste
            </Label>
          </div>

          {question.matrixShowExplanation && (
            <div className="ml-6">
              <Label className="text-sm text-slate-600">Açıklama Etiketi *</Label>
              <Input
                value={question.matrixExplanationLabel || ''}
                onChange={(e) => onChange({ ...question, matrixExplanationLabel: e.target.value })}
                placeholder="Örn: Lütfen nedenini açıklayınız"
                className="mt-1"
              />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="border-t pt-4 mt-4">
          <Label className="font-semibold mb-3 block text-slate-500">Önizleme</Label>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border p-2 text-left min-w-[200px]"></th>
                  {(question.matrixScaleLabels || DEFAULT_SCALE_LABELS).map((label, i) => (
                    <th key={i} className="border p-2 text-center min-w-[80px] text-xs">
                      {label || `(${i + 1})`}
                    </th>
                  ))}
                  {question.matrixShowExplanation && (
                    <th className="border p-2 text-center min-w-[150px] text-xs">
                      {question.matrixExplanationLabel || 'Açıklama'}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {question.options.slice(0, 3).map((option, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-slate-700">
                      {option.text || `Madde ${i + 1}`}
                    </td>
                    {[1, 2, 3, 4, 5].map((scale) => (
                      <td key={scale} className="border p-2 text-center">
                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full mx-auto" />
                      </td>
                    ))}
                    {question.matrixShowExplanation && (
                      <td className="border p-2">
                        <div className="h-6 bg-slate-100 rounded text-xs text-slate-400 flex items-center justify-center">
                          (1-2 seçilirse)
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {question.options.length > 3 && (
                  <tr>
                    <td colSpan={question.matrixShowExplanation ? 7 : 6} className="border p-2 text-center text-slate-400 text-xs">
                      ... ve {question.options.length - 3} madde daha
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
