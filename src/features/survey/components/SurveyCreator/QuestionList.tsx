import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { QuestionFormData, getAllQuestionTypes } from '../../question-types';
import { QuestionEditor } from './QuestionEditor';
import { QuestionType } from '@/src/types';

interface QuestionListProps {
  questions: QuestionFormData[];
  onChange: (questions: QuestionFormData[]) => void;
}

export function QuestionList({ questions, onChange }: QuestionListProps) {
  const questionTypes = getAllQuestionTypes();

  const addQuestion = (type: QuestionType) => {
    const newQuestion: QuestionFormData = {
      text: '',
      description: undefined,
      type,
      order: questions.length + 1,
      isRequired: true,
      attachment: null,
      options: [],
      allowedAttachmentContentTypes: undefined,
    };

    onChange([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);

    updated.forEach((q, i) => {
      q.order = i + 1;
    });
    onChange(updated);
  };

  const updateQuestion = (index: number, updated: QuestionFormData) => {
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    onChange(newQuestions);
  };

  const reorderQuestion = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const updated = [...questions];
    const [movedQuestion] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedQuestion);

    updated.forEach((q, i) => {
      q.order = i + 1;
    });

    onChange(updated);
  };

  return (
    <Card className="bg-white">
      <CardHeader className="border-b">
        <CardTitle className="text-slate-800">Sorular</CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded border-2 border-dashed border-slate-200">
            <svg
              className="w-16 h-16 mx-auto text-slate-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-semibold text-slate-700 mb-1">Henüz soru eklenmedi</p>
            <p className="text-sm text-slate-600 mb-6">Aşağıdaki butonu kullanarak soru eklemeye başlayın</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionEditor
                key={index}
                question={question}
                questionIndex={index}
                totalQuestions={questions.length}
                onChange={(updated) => updateQuestion(index, updated)}
                onRemove={() => removeQuestion(index)}
                onReorder={(newIndex) => reorderQuestion(index, newIndex)}
              />
            ))}
          </div>
        )}

        {}
        <div className="mt-6 pt-4 border-t">
          <Select
            value=""
            onValueChange={(value) => addQuestion(value as QuestionType)}
          >
            <SelectTrigger
              className="w-full h-12 border-2 border-dashed hover:border-solid hover:bg-blue-50 transition-colors"
              style={{ borderColor: '#0055a5' }}
            >
              <div className="flex items-center justify-center gap-2 font-medium" style={{ color: '#0055a5' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <SelectValue placeholder="Soru Ekle" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              {questionTypes.map((qt) => (
                <SelectItem key={qt.type} value={qt.type}>
                  <div className="flex items-center gap-2">
                    {qt.icon}
                    <span>{qt.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
