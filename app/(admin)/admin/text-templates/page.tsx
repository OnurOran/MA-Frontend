'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog';
import {
  useTextTemplates,
  useCreateTextTemplate,
  useUpdateTextTemplate,
  useDeleteTextTemplate,
} from '@/src/features/textTemplate/hooks';
import { TextTemplateDto, TextTemplateType, CreateTextTemplateRequest } from '@/src/types';

const typeLabels: Record<TextTemplateType, string> = {
  Intro: 'Giriş Metni',
  Consent: 'Onay Metni',
  Outro: 'Teşekkür Metni',
};

export default function TextTemplatesPage() {
  const { data: templates, isLoading } = useTextTemplates();
  const createTemplate = useCreateTextTemplate();
  const updateTemplate = useUpdateTextTemplate();
  const deleteTemplate = useDeleteTextTemplate();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TextTemplateDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TextTemplateDto | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState<TextTemplateType>('Intro');

  const openCreate = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormContent('');
    setFormType('Intro');
    setFormOpen(true);
  };

  const openEdit = (template: TextTemplateDto) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormContent(template.content);
    setFormType(template.type);
    setFormOpen(true);
  };

  const openDelete = (template: TextTemplateDto) => {
    setDeleteTarget(template);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data: CreateTextTemplateRequest = {
      title: formTitle,
      content: formContent,
      type: formType,
    };

    if (editingTemplate) {
      await updateTemplate.mutateAsync({ id: editingTemplate.id, data });
    } else {
      await createTemplate.mutateAsync(data);
    }

    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteTemplate.mutateAsync(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Metin Şablonları</h2>
          <p className="text-muted-foreground">
            Anketlerde kullanılacak giriş, onay ve teşekkür metinlerini yönetin.
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Şablon
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Yükleniyor...</div>
      ) : !templates || templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground">Henüz metin şablonu oluşturulmamış.</p>
            <Button className="mt-4" onClick={openCreate}>
              İlk Şablonu Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Şablonlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Başlık</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tür</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Oluşturulma Tarihi</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{template.title}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {typeLabels[template.type]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(template.createDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(template)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDelete(template)}>
                            <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Şablonu Düzenle' : 'Yeni Şablon Oluştur'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="templateTitle">Başlık *</Label>
              <Input
                id="templateTitle"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Şablon başlığı"
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="templateType">Tür *</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as TextTemplateType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Intro">Giriş Metni</SelectItem>
                  <SelectItem value="Consent">Onay Metni</SelectItem>
                  <SelectItem value="Outro">Teşekkür Metni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="templateContent">İçerik *</Label>
              <Textarea
                id="templateContent"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Şablon içeriği..."
                rows={8}
                maxLength={4000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formContent.length}/4000
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || !formContent.trim() || isPending}
            >
              {isPending
                ? 'Kaydediliyor...'
                : editingTemplate
                ? 'Güncelle'
                : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              Şablonu Sil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">&quot;{deleteTarget?.title}&quot;</strong> şablonunu silmek istediğinize emin misiniz?
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTemplate.isPending}
              >
                {deleteTemplate.isPending ? 'Siliniyor...' : 'Sil'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
