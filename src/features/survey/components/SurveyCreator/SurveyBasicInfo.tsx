import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { AttachmentUpload } from '../AttachmentUpload';
import { AttachmentData } from '../../question-types/types';

interface SurveyBasicInfoProps {
  title: string;
  description: string;
  introText?: string;
  consentText?: string;
  outroText?: string;
  accessType: 'Internal' | 'Public';
  attachment: AttachmentData | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onIntroTextChange?: (introText: string) => void;
  onConsentTextChange?: (consentText: string) => void;
  onOutroTextChange?: (outroText: string) => void;
  onAccessTypeChange: (accessType: 'Internal' | 'Public') => void;
  onAttachmentChange: (attachment: AttachmentData | null) => void;
}

export function SurveyBasicInfo({
  title,
  description,
  introText,
  consentText,
  outroText,
  accessType,
  attachment,
  onTitleChange,
  onDescriptionChange,
  onIntroTextChange,
  onConsentTextChange,
  onOutroTextChange,
  onAccessTypeChange,
  onAttachmentChange,
}: SurveyBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Temel Bilgiler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {}
        <div>
          <Label htmlFor="title">Anket Başlığı *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Örn: Çalışan Memnuniyet Anketi 2025"
            required
          />
        </div>

        {}
        <div>
          <Label htmlFor="description">Açıklama *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Anket hakkında kısa bir açıklama..."
            rows={3}
            required
          />
        </div>

        {}
        <div>
          <Label htmlFor="introText">Giriş Metni (Opsiyonel)</Label>
          <p className="text-sm text-slate-500 mb-2">
            Ankete başlamadan önce gösterilecek açıklama metni (örn: yasal bilgilendirme, KVKK metni)
          </p>
          <Textarea
            id="introText"
            value={introText || ''}
            onChange={(e) => onIntroTextChange?.(e.target.value)}
            placeholder="Katılımcılara gösterilecek giriş metni..."
            rows={4}
          />
        </div>

        {}
        <div>
          <Label htmlFor="consentText">Onay Metni (Opsiyonel)</Label>
          <p className="text-sm text-slate-500 mb-2">
            Katılımcıların onaylaması gereken metin. Bu alan doldurulursa katılımcılar ankete başlamadan önce onay vermek zorundadır.
          </p>
          <Textarea
            id="consentText"
            value={consentText || ''}
            onChange={(e) => onConsentTextChange?.(e.target.value)}
            placeholder="Örn: Kişisel verilerimin işlenmesini kabul ediyorum..."
            rows={3}
          />
        </div>

        {}
        <div>
          <Label htmlFor="outroText">Teşekkür Metni (Opsiyonel)</Label>
          <p className="text-sm text-slate-500 mb-2">
            Anket tamamlandığında gösterilecek teşekkür mesajı
          </p>
          <Textarea
            id="outroText"
            value={outroText || ''}
            onChange={(e) => onOutroTextChange?.(e.target.value)}
            placeholder="Örn: Katılımınız için teşekkür ederiz..."
            rows={3}
          />
        </div>

        {}
        <div>
          <Label htmlFor="accessType">Erişim Tipi *</Label>
          <Select value={accessType} onValueChange={onAccessTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Internal">Dahili (Sadece Çalışanlar)</SelectItem>
              <SelectItem value="Public">Halka Açık</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {}
        <div>
          <Label>Anket Eki (Opsiyonel)</Label>
          <p className="text-sm text-slate-500 mb-2">
            Anketin başında gösterilecek bir dosya ekleyebilirsiniz (örn: logo, açıklama dokümanı)
          </p>
          <AttachmentUpload
            attachment={attachment}
            onChange={onAttachmentChange}
            label="Dosya Ekle"
          />
        </div>
      </CardContent>
    </Card>
  );
}
