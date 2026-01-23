'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { QuestionFormData, ChildQuestionFormData, OptionFormData, QuestionEditorProps } from '../types';
import { QuestionType } from '@/src/types';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { AttachmentUpload } from '../../components/AttachmentUpload';

const AVAILABLE_CONTENT_TYPES = [
  { value: 'image/png', label: 'PNG Images' },
  { value: 'image/jpeg', label: 'JPEG Images' },
  { value: 'image/jpg', label: 'JPG Images' },
  { value: 'image/webp', label: 'WebP Images' },
  { value: 'application/pdf', label: 'PDF Documents' },
];

export function ConditionalEditor({
  question,
  questionIndex,
  totalQuestions,
  onChange,
  onRemove,
  onReorder,
}: QuestionEditorProps) {
  const [expandedOptions, setExpandedOptions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const needsOptions = question.options.length < 2;
    const needsChildren = question.childQuestions === undefined;

    if (!needsOptions && !needsChildren) {
      return;
    }

    const fixedOptions = needsOptions
      ? [
          ...(question.options.length > 0
            ? question.options.map((opt, idx) => ({ ...opt, order: idx + 1, value: idx + 1 }))
            : []),
          ...Array.from({ length: 2 - question.options.length }, (_, idx) => {
            const order = question.options.length + idx + 1;
            return { text: '', order, value: order, attachment: null };
          }),
        ]
      : question.options;

    onChange({
      ...question,
      options: fixedOptions,
      childQuestions: question.childQuestions ?? [],
    });
  }, [onChange, question]);

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], text };
    onChange({ ...question, options: newOptions });
  };

  const toggleOptionExpanded = (order: number) => {
    setExpandedOptions(prev => ({ ...prev, [order]: !prev[order] }));
  };

  const addChildQuestion = (parentOptionOrder: number) => {
    const childQuestions = question.childQuestions || [];
    const newChildQuestion: ChildQuestionFormData = {
      parentOptionOrder,
      text: '',
      description: undefined,
      type: 'SingleSelect',
      order: childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder).length + 1,
      isRequired: false,
      attachment: null,
      options: [],
    };

    onChange({
      ...question,
      childQuestions: [...childQuestions, newChildQuestion],
    });
  };

  const removeChildQuestion = (parentOptionOrder: number, childIndex: number) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const childToRemove = optionChildren[childIndex];

    const newChildQuestions = childQuestions.filter(cq => cq !== childToRemove);

    onChange({
      ...question,
      childQuestions: newChildQuestions,
    });
  };

  const updateChildQuestion = (parentOptionOrder: number, childIndex: number, updates: Partial<ChildQuestionFormData>) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const childToUpdate = optionChildren[childIndex];

    const newChildQuestions = childQuestions.map(cq =>
      cq === childToUpdate ? { ...cq, ...updates } : cq
    );

    onChange({
      ...question,
      childQuestions: newChildQuestions,
    });
  };

  useEffect(() => {
    if (!question.childQuestions || question.childQuestions.length === 0) return;

    let updated = false;
    const updatedChildren = question.childQuestions.map(child => {
      if ((child.type === 'SingleSelect' || child.type === 'MultiSelect') && child.options.length < 2) {
        updated = true;
        const padded = [
          ...child.options.map((opt, idx) => ({ ...opt, order: idx + 1 })),
          ...Array.from({ length: 2 - child.options.length }, (_, idx) => {
            const order = child.options.length + idx + 1;
            return { text: '', order, value: order, attachment: null };
          }),
        ];
        return { ...child, options: padded };
      }
      return child;
    });

    if (updated) {
      onChange({ ...question, childQuestions: updatedChildren });
    }
  }, [onChange, question]);

  const addChildOption = (parentOptionOrder: number, childIndex: number) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const child = optionChildren[childIndex];

    if (child.options.length >= 10) return;

    const newOption: OptionFormData = {
      text: '',
      order: child.options.length + 1,
      value: child.options.length + 1,
      attachment: null,
    };

    updateChildQuestion(parentOptionOrder, childIndex, {
      options: [...child.options, newOption],
    });
  };

  const removeChildOption = (parentOptionOrder: number, childIndex: number, optionIndex: number) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const child = optionChildren[childIndex];

    const newOptions = child.options.filter((_, idx) => idx !== optionIndex);

    newOptions.forEach((opt, i) => {
      opt.order = i + 1;
    });

    updateChildQuestion(parentOptionOrder, childIndex, {
      options: newOptions,
    });
  };

  const reorderChildOption = (parentOptionOrder: number, childIndex: number, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const child = optionChildren[childIndex];

    const newOptions = [...child.options];
    const [movedOption] = newOptions.splice(fromIndex, 1);
    newOptions.splice(toIndex, 0, movedOption);

    newOptions.forEach((opt, i) => {
      opt.order = i + 1;
    });

    updateChildQuestion(parentOptionOrder, childIndex, {
      options: newOptions,
    });
  };

  const updateChildOption = (parentOptionOrder: number, childIndex: number, optionIndex: number, text: string) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const child = optionChildren[childIndex];

    const newOptions = [...child.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], text };

    updateChildQuestion(parentOptionOrder, childIndex, {
      options: newOptions,
    });
  };

  const getChildrenForOption = (optionOrder: number): ChildQuestionFormData[] => {
    return (question.childQuestions || [])
      .filter(cq => cq.parentOptionOrder === optionOrder)
      .sort((a, b) => a.order - b.order);
  };

  const reorderChildQuestion = (parentOptionOrder: number, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const childQuestions = question.childQuestions || [];
    const optionChildren = getChildrenForOption(parentOptionOrder);

    const movedChild = optionChildren[fromIndex];

    const reordered = [...optionChildren];
    reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedChild);

    reordered.forEach((child, idx) => {
      child.order = idx + 1;
    });

    const otherChildren = childQuestions.filter(cq => cq.parentOptionOrder !== parentOptionOrder);
    const newChildQuestions = [...otherChildren, ...reordered];

    onChange({ ...question, childQuestions: newChildQuestions });
  };

  const toggleChildQuestionContentType = (parentOptionOrder: number, childIndex: number, contentType: string) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const child = optionChildren[childIndex];

    const current = child.allowedAttachmentContentTypes || [];
    const updated = current.includes(contentType)
      ? current.filter((t) => t !== contentType)
      : [...current, contentType];

    updateChildQuestion(parentOptionOrder, childIndex, {
      allowedAttachmentContentTypes: updated.length > 0 ? updated : undefined,
    });
  };

  const childQuestionTypes: QuestionType[] = ['SingleSelect', 'MultiSelect', 'OpenText', 'FileUpload'];

  const addParentOption = () => {
    if (question.options.length >= 5) return;
    const newOptions = [
      ...question.options,
      { text: '', order: question.options.length + 1, value: question.options.length + 1, attachment: null },
    ];
    onChange({ ...question, options: newOptions });
  };

  const removeParentOption = (index: number) => {
    const optionToRemove = question.options[index];
    const remainingOptions = question.options.filter((_, i) => i !== index);

    const remainingChildren = (question.childQuestions || []).filter(
      (cq) => cq.parentOptionOrder !== optionToRemove.order
    );

    const reindexedOptions = remainingOptions.map((opt, idx) => ({ ...opt, order: idx + 1, value: idx + 1 }));
    const reindexedChildren = remainingChildren.map((cq) => {

      const newOrder = cq.parentOptionOrder > optionToRemove.order ? cq.parentOptionOrder - 1 : cq.parentOptionOrder;
      return { ...cq, parentOptionOrder: newOrder };
    });

    onChange({
      ...question,
      options: reindexedOptions,
      childQuestions: reindexedChildren,
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
              Koşullu Soru
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
        <div className="space-y-4">
          <div>
            <Label className="font-semibold">Soru Metni *</Label>
            <Input
              value={question.text}
              onChange={(e) => onChange({ ...question, text: e.target.value, description: undefined })}
              placeholder="Koşullu sorunuzu yazın..."
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={question.isRequired}
              onCheckedChange={(checked) => onChange({ ...question, isRequired: checked as boolean, description: undefined })}
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
        </div>

      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Seçenekler (2-5 adet)</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addParentOption}
            disabled={question.options.length >= 5}
          >
            <Plus className="h-4 w-4 mr-2" />
            Seçenek Ekle
          </Button>
        </div>

        {question.options.map((option, index) => {
          const isExpanded = expandedOptions[option.order];
          const children = getChildrenForOption(option.order);

          return (
            <Card key={option.order} className="border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleOptionExpanded(option.order)}
                    className="p-1"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>

                  <div className="flex-1 space-y-2">
                    <div>
                      <Label>Seçenek {option.order}</Label>
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        placeholder={`Seçenek ${option.order} metni...`}
                        className="mt-1"
                      />
                    </div>
                    {}
                    <AttachmentUpload
                      attachment={option.attachment}
                      onChange={(attachment) => {
                        const newOptions = [...question.options];
                        newOptions[index] = { ...newOptions[index], attachment };
                        onChange({ ...question, options: newOptions });
                      }}
                      label="Dosya Ekle"
                    />
                  </div>

                  <div className="text-sm text-slate-500">
                    {children.length} alt soru
                  </div>
                  {question.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParentOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4">
                  {}
                  {children.length > 0 && (
                    <div className="space-y-3">
                      {children.map((child, childIdx) => (
                        <Card key={childIdx} className="border-slate-200 bg-slate-50">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-3">
                                {}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Label className="flex-1">Alt Soru {childIdx + 1}</Label>
                                    <Select
                                      value={String(childIdx + 1)}
                                      onValueChange={(value) => reorderChildQuestion(option.order, childIdx, parseInt(value) - 1)}
                                    >
                                      <SelectTrigger className="w-20 h-8 text-sm bg-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white z-50">
                                        {Array.from({ length: children.length }, (_, i) => (
                                          <SelectItem key={i} value={String(i + 1)}>
                                            {i + 1}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Input
                                    value={child.text}
                                    onChange={(e) => updateChildQuestion(option.order, childIdx, { text: e.target.value })}
                                    placeholder="Alt soru metni..."
                                  />
                                </div>

                                {}
                                <div className="flex gap-3">
                                  <div className="flex-1">
                                    <Label>Soru Tipi</Label>
                                    <Select
                                      value={child.type}
                                      onValueChange={(value) => updateChildQuestion(option.order, childIdx, { type: value as QuestionType })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white z-50">
                                        {childQuestionTypes.map(type => (
                                          <SelectItem key={type} value={type}>
                                            {type === 'SingleSelect' ? 'Tek Seçim' :
                                             type === 'MultiSelect' ? 'Çoklu Seçim' :
                                             type === 'OpenText' ? 'Açık Uçlu' :
                                             'Dosya Yükleme'}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex items-end">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`child-required-${option.order}-${childIdx}`}
                                        checked={child.isRequired}
                                        onCheckedChange={(checked) => updateChildQuestion(option.order, childIdx, { isRequired: checked as boolean })}
                                      />
                                      <Label htmlFor={`child-required-${option.order}-${childIdx}`} className="cursor-pointer text-sm">
                                        Zorunlu
                                      </Label>
                                    </div>
                                  </div>
                                </div>

                                {}
                                <div>
                                  <Label className="text-sm font-semibold text-slate-700">Soru Eki (Opsiyonel)</Label>
                                  <AttachmentUpload
                                    attachment={child.attachment}
                                    onChange={(attachment) => updateChildQuestion(option.order, childIdx, { attachment })}
                                    label="Dosya Ekle"
                                  />
                                </div>

                                {}
                                {child.type === 'FileUpload' && (
                                  <div className="border-t pt-3">
                                    <Label className="mb-2 block text-sm font-semibold">
                                      İzin Verilen Dosya Tipleri
                                      <span className="text-xs text-slate-500 font-normal ml-2">(Boş bırakılırsa tüm tipler kabul edilir)</span>
                                    </Label>
                                    <div className="space-y-2">
                                      {AVAILABLE_CONTENT_TYPES.map((type) => {
                                        const allowedTypes = child.allowedAttachmentContentTypes || [];
                                        return (
                                          <div key={type.value} className="flex items-center gap-2">
                                            <Checkbox
                                              checked={allowedTypes.includes(type.value)}
                                              onCheckedChange={() => toggleChildQuestionContentType(option.order, childIdx, type.value)}
                                            />
                                            <Label className="cursor-pointer text-sm font-normal">{type.label}</Label>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {child.allowedAttachmentContentTypes && child.allowedAttachmentContentTypes.length > 0 && (
                                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs" style={{ color: '#0055a5' }}>
                                        <strong>Seçili tipler:</strong> {child.allowedAttachmentContentTypes.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {}
                                {(child.type === 'SingleSelect' || child.type === 'MultiSelect') && (
                                  <div className="space-y-2">
                                    <Label className="text-sm">Seçenekler</Label>
                                    {child.options.map((opt, optIdx) => (
                                      <div key={optIdx} className="p-3 border rounded bg-white space-y-2">
                                        <div className="flex gap-2">
                                          {}
                                          <div className="flex items-center justify-center w-8 h-9 bg-slate-50 border rounded">
                                            <div
                                              className={`w-3 h-3 border-2 border-slate-400 ${
                                                child.type === 'SingleSelect' ? 'rounded-full' : 'rounded-sm'
                                              }`}
                                            />
                                          </div>
                                          <Input
                                            value={opt.text}
                                            onChange={(e) => updateChildOption(option.order, childIdx, optIdx, e.target.value)}
                                            placeholder={`Seçenek ${optIdx + 1}`}
                                            className="flex-1"
                                          />
                                          {}
                                          <Select
                                            value={String(optIdx + 1)}
                                            onValueChange={(value) => reorderChildOption(option.order, childIdx, optIdx, parseInt(value) - 1)}
                                          >
                                            <SelectTrigger className="w-20 h-9 text-sm bg-white">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white z-50">
                                              {Array.from({ length: child.options.length }, (_, i) => (
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
                                            onClick={() => removeChildOption(option.order, childIdx, optIdx)}
                                            className="text-red-600 hover:text-white hover:bg-red-600 disabled:opacity-50"
                                            disabled={child.options.length <= 2}
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </Button>
                                        </div>
                                        {}
                                        <div className="pl-10">
                                          <AttachmentUpload
                                            attachment={opt.attachment}
                                            onChange={(attachment) => {
                                              const childQuestions = question.childQuestions || [];
                                              const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === option.order);
                                              const childToUpdate = optionChildren[childIdx];
                                              const newOptions = [...childToUpdate.options];
                                              newOptions[optIdx] = { ...newOptions[optIdx], attachment };
                                              updateChildQuestion(option.order, childIdx, { options: newOptions });
                                            }}
                                            label="Dosya Ekle"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addChildOption(option.order, childIdx)}
                                      className="w-full disabled:opacity-50"
                                      disabled={child.options.length >= 10}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Seçenek Ekle
                                    </Button>
                                  </div>
                                )}
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChildQuestion(option.order, childIdx)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addChildQuestion(option.order)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Alt Soru Ekle
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <strong>Not:</strong> Koşullu sorular 2-5 seçenek içerir. Katılımcı bir seçenek seçtiğinde, o seçeneğe bağlı alt sorular gösterilir.
      </div>
      </CardContent>
    </Card>
  );
}
