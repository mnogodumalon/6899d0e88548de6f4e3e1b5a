import { useState, useEffect, useMemo } from 'react';
import type { Kursverwaltung, Kursleiterzuordnung, Teilnehmeranmeldung } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Calendar,
  Users,
  UserPlus,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Clock,
  Phone,
  Mail,
  X,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// --------------- Helpers ---------------

function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    return format(d, "dd.MM.yyyy 'um' HH:mm 'Uhr'", { locale: de });
  } catch {
    return dateStr;
  }
}

function formatDateShort(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    return format(d, 'dd. MMM', { locale: de });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const d = parseISO(dateStr);
    return format(d, 'HH:mm', { locale: de });
  } catch {
    return '';
  }
}

function isTodayOrFuture(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  try {
    const d = parseISO(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  } catch {
    return false;
  }
}

function isToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  try {
    const d = parseISO(dateStr);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}

function getTomorrowDefault(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T10:00`;
}

// --------------- Delete Confirmation Dialog ---------------

function DeleteConfirmDialog({
  open,
  onOpenChange,
  recordName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordName: string;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      toast.success(`"${recordName}" wurde gelöscht.`);
      onOpenChange(false);
    } catch {
      toast.error('Eintrag konnte nicht gelöscht werden.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchtest du &quot;{recordName}&quot; wirklich löschen? Diese Aktion kann nicht
            rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting ? 'Löscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// --------------- Kurs (Course) Dialog ---------------

function KursDialog({
  open,
  onOpenChange,
  kurs,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kurs?: Kursverwaltung | null;
  onSuccess: () => void;
}) {
  const isEditing = !!kurs;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    kurs_name: '',
    kurs_beschreibung: '',
    kurs_zeitplan: getTomorrowDefault(),
    kurs_ort: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        kurs_name: kurs?.fields.kurs_name ?? '',
        kurs_beschreibung: kurs?.fields.kurs_beschreibung ?? '',
        kurs_zeitplan: kurs?.fields.kurs_zeitplan ?? getTomorrowDefault(),
        kurs_ort: kurs?.fields.kurs_ort ?? '',
      });
    }
  }, [open, kurs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apiData = {
        kurs_name: formData.kurs_name,
        kurs_beschreibung: formData.kurs_beschreibung || undefined,
        kurs_zeitplan: formData.kurs_zeitplan, // Already YYYY-MM-DDTHH:MM from input
        kurs_ort: formData.kurs_ort || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateKursverwaltungEntry(kurs!.record_id, apiData);
        toast.success('Kurs wurde aktualisiert.');
      } else {
        await LivingAppsService.createKursverwaltungEntry(apiData);
        toast.success('Neuer Kurs wurde erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Kurs bearbeiten' : 'Neuen Kurs erstellen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kurs_name">Kursname *</Label>
            <Input
              id="kurs_name"
              value={formData.kurs_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, kurs_name: e.target.value }))}
              required
              placeholder="z.B. Hatha Yoga Anfänger"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kurs_beschreibung">Beschreibung</Label>
            <Textarea
              id="kurs_beschreibung"
              value={formData.kurs_beschreibung}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, kurs_beschreibung: e.target.value }))
              }
              placeholder="Kursbeschreibung..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kurs_zeitplan">Zeitplan *</Label>
            <Input
              id="kurs_zeitplan"
              type="datetime-local"
              value={formData.kurs_zeitplan}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, kurs_zeitplan: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kurs_ort">Ort</Label>
            <Input
              id="kurs_ort"
              value={formData.kurs_ort}
              onChange={(e) => setFormData((prev) => ({ ...prev, kurs_ort: e.target.value }))}
              placeholder="z.B. Raum 1, Studio Mitte"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------- Kurs Detail Dialog ---------------

function KursDetailDialog({
  open,
  onOpenChange,
  kurs,
  instructorName,
  participantCount,
  participants,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kurs: Kursverwaltung;
  instructorName: string | null;
  participantCount: number;
  participants: string[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {kurs.fields.kurs_name || 'Kurs'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {kurs.fields.kurs_beschreibung && (
            <p className="text-sm text-muted-foreground">{kurs.fields.kurs_beschreibung}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDateTime(kurs.fields.kurs_zeitplan)}</span>
            </div>
            {kurs.fields.kurs_ort && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{kurs.fields.kurs_ort}</span>
              </div>
            )}
          </div>
          {instructorName && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Kursleiter: <span className="font-medium">{instructorName}</span></span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium mb-1">
              Teilnehmer ({participantCount})
            </p>
            {participants.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {participants.map((name, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Teilnehmer angemeldet.</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" /> Bearbeiten
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --------------- Teilnehmer (Participant) Dialog ---------------

function TeilnehmerDialog({
  open,
  onOpenChange,
  teilnehmer,
  kurse,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teilnehmer?: Teilnehmeranmeldung | null;
  kurse: Kursverwaltung[];
  onSuccess: () => void;
}) {
  const isEditing = !!teilnehmer;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    teilnehmer_vorname: '',
    teilnehmer_nachname: '',
    teilnehmer_email: '',
    angemeldete_kurse: '' as string,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        teilnehmer_vorname: teilnehmer?.fields.teilnehmer_vorname ?? '',
        teilnehmer_nachname: teilnehmer?.fields.teilnehmer_nachname ?? '',
        teilnehmer_email: teilnehmer?.fields.teilnehmer_email ?? '',
        angemeldete_kurse: teilnehmer?.fields.angemeldete_kurse ?? '',
      });
    }
  }, [open, teilnehmer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apiData: Teilnehmeranmeldung['fields'] = {
        teilnehmer_vorname: formData.teilnehmer_vorname,
        teilnehmer_nachname: formData.teilnehmer_nachname,
        teilnehmer_email: formData.teilnehmer_email || undefined,
        angemeldete_kurse: formData.angemeldete_kurse || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateTeilnehmeranmeldungEntry(teilnehmer!.record_id, apiData);
        toast.success('Teilnehmer wurde aktualisiert.');
      } else {
        await LivingAppsService.createTeilnehmeranmeldungEntry(apiData);
        toast.success('Teilnehmer wurde angemeldet.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Anmelden'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Teilnehmer bearbeiten' : 'Teilnehmer anmelden'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="t_vorname">Vorname *</Label>
              <Input
                id="t_vorname"
                value={formData.teilnehmer_vorname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, teilnehmer_vorname: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t_nachname">Nachname *</Label>
              <Input
                id="t_nachname"
                value={formData.teilnehmer_nachname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, teilnehmer_nachname: e.target.value }))
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_email">E-Mail</Label>
            <Input
              id="t_email"
              type="email"
              value={formData.teilnehmer_email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, teilnehmer_email: e.target.value }))
              }
              placeholder="teilnehmer@example.de"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_kurse">Angemeldeter Kurs</Label>
            <Select
              value={formData.angemeldete_kurse || 'none'}
              onValueChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  angemeldete_kurse: v === 'none' ? '' : v,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kurs auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Kurs</SelectItem>
                {kurse.map((k) => (
                  <SelectItem
                    key={k.record_id}
                    value={createRecordUrl(APP_IDS.KURSVERWALTUNG, k.record_id)}
                  >
                    {k.fields.kurs_name || 'Unbenannter Kurs'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Anmelden'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------- Kursleiter (Instructor) Dialog ---------------

function KursleiterDialog({
  open,
  onOpenChange,
  kursleiter,
  kurse,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kursleiter?: Kursleiterzuordnung | null;
  kurse: Kursverwaltung[];
  onSuccess: () => void;
}) {
  const isEditing = !!kursleiter;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    kursleiter_vorname: '',
    kursleiter_nachname: '',
    kursleiter_kontakt: '',
    zugewiesener_kurs: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        kursleiter_vorname: kursleiter?.fields.kursleiter_vorname ?? '',
        kursleiter_nachname: kursleiter?.fields.kursleiter_nachname ?? '',
        kursleiter_kontakt: kursleiter?.fields.kursleiter_kontakt ?? '',
        zugewiesener_kurs: kursleiter?.fields.zugewiesener_kurs ?? '',
      });
    }
  }, [open, kursleiter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apiData: Kursleiterzuordnung['fields'] = {
        kursleiter_vorname: formData.kursleiter_vorname,
        kursleiter_nachname: formData.kursleiter_nachname,
        kursleiter_kontakt: formData.kursleiter_kontakt || undefined,
        zugewiesener_kurs: formData.zugewiesener_kurs || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateKursleiterzuordnungEntry(
          kursleiter!.record_id,
          apiData,
        );
        toast.success('Kursleiter wurde aktualisiert.');
      } else {
        await LivingAppsService.createKursleiterzuordnungEntry(apiData);
        toast.success('Kursleiter wurde hinzugefügt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Kursleiter bearbeiten' : 'Kursleiter hinzufügen'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="kl_vorname">Vorname *</Label>
              <Input
                id="kl_vorname"
                value={formData.kursleiter_vorname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, kursleiter_vorname: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kl_nachname">Nachname *</Label>
              <Input
                id="kl_nachname"
                value={formData.kursleiter_nachname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, kursleiter_nachname: e.target.value }))
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kl_kontakt">Telefon</Label>
            <Input
              id="kl_kontakt"
              type="tel"
              value={formData.kursleiter_kontakt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, kursleiter_kontakt: e.target.value }))
              }
              placeholder="+49 123 456 789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kl_kurs">Zugewiesener Kurs</Label>
            <Select
              value={formData.zugewiesener_kurs || 'none'}
              onValueChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  zugewiesener_kurs: v === 'none' ? '' : v,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kurs auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Kurs</SelectItem>
                {kurse.map((k) => (
                  <SelectItem
                    key={k.record_id}
                    value={createRecordUrl(APP_IDS.KURSVERWALTUNG, k.record_id)}
                  >
                    {k.fields.kurs_name || 'Unbenannter Kurs'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------- Loading State ---------------

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// --------------- Error State ---------------

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h2 className="text-lg font-bold mb-1">Fehler beim Laden</h2>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --------------- Empty Course State ---------------

function EmptyCourseState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
      <h3 className="font-bold text-lg mb-1">Noch keine Kurse</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Erstelle deinen ersten Yoga-Kurs, um loszulegen.
      </p>
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4 mr-1" /> Ersten Kurs erstellen
      </Button>
    </div>
  );
}

// --------------- Main Dashboard ---------------

export default function Dashboard() {
  const [kurse, setKurse] = useState<Kursverwaltung[]>([]);
  const [kursleiter, setKursleiter] = useState<Kursleiterzuordnung[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmeranmeldung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Dialog states
  const [showKursDialog, setShowKursDialog] = useState(false);
  const [editKurs, setEditKurs] = useState<Kursverwaltung | null>(null);
  const [detailKurs, setDetailKurs] = useState<Kursverwaltung | null>(null);
  const [deleteKurs, setDeleteKurs] = useState<Kursverwaltung | null>(null);

  const [showTeilnehmerDialog, setShowTeilnehmerDialog] = useState(false);
  const [editTeilnehmer, setEditTeilnehmer] = useState<Teilnehmeranmeldung | null>(null);
  const [deleteTeilnehmer, setDeleteTeilnehmer] = useState<Teilnehmeranmeldung | null>(null);

  const [showKursleiterDialog, setShowKursleiterDialog] = useState(false);
  const [editKursleiter, setEditKursleiter] = useState<Kursleiterzuordnung | null>(null);
  const [deleteKursleiter, setDeleteKursleiter] = useState<Kursleiterzuordnung | null>(null);

  // Fetch all data
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [k, kl, t] = await Promise.all([
        LivingAppsService.getKursverwaltung(),
        LivingAppsService.getKursleiterzuordnung(),
        LivingAppsService.getTeilnehmeranmeldung(),
      ]);
      setKurse(k);
      setKursleiter(kl);
      setTeilnehmer(t);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Course map for lookups
  const kursMap = useMemo(() => {
    const map = new Map<string, Kursverwaltung>();
    kurse.forEach((k) => map.set(k.record_id, k));
    return map;
  }, [kurse]);

  // Instructor → course mapping
  const instructorByCourseId = useMemo(() => {
    const map = new Map<string, Kursleiterzuordnung>();
    kursleiter.forEach((kl) => {
      const courseId = extractRecordId(kl.fields.zugewiesener_kurs);
      if (courseId) map.set(courseId, kl);
    });
    return map;
  }, [kursleiter]);

  // Participants grouped by course
  const participantsByCourseId = useMemo(() => {
    const map = new Map<string, Teilnehmeranmeldung[]>();
    teilnehmer.forEach((t) => {
      const courseUrl = t.fields.angemeldete_kurse;
      if (!courseUrl) return;
      // multipleapplookup could be comma-separated or a single URL
      const urls = courseUrl.includes(',') ? courseUrl.split(',').map((u) => u.trim()) : [courseUrl];
      urls.forEach((url) => {
        const courseId = extractRecordId(url);
        if (!courseId) return;
        if (!map.has(courseId)) map.set(courseId, []);
        map.get(courseId)!.push(t);
      });
    });
    return map;
  }, [teilnehmer]);

  // Sorted courses: upcoming first
  const sortedKurse = useMemo(() => {
    return [...kurse].sort((a, b) => {
      const dateA = a.fields.kurs_zeitplan ?? '';
      const dateB = b.fields.kurs_zeitplan ?? '';
      return dateA.localeCompare(dateB);
    });
  }, [kurse]);

  // Sorted participants
  const sortedTeilnehmer = useMemo(() => {
    return [...teilnehmer].sort((a, b) => {
      const nameA = (a.fields.teilnehmer_nachname ?? '').toLowerCase();
      const nameB = (b.fields.teilnehmer_nachname ?? '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [teilnehmer]);

  // Sorted instructors
  const sortedKursleiter = useMemo(() => {
    return [...kursleiter].sort((a, b) => {
      const nameA = (a.fields.kursleiter_nachname ?? '').toLowerCase();
      const nameB = (b.fields.kursleiter_nachname ?? '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [kursleiter]);

  // Helper to get instructor name for a course
  function getInstructorName(courseId: string): string | null {
    const kl = instructorByCourseId.get(courseId);
    if (!kl) return null;
    return `${kl.fields.kursleiter_vorname ?? ''} ${kl.fields.kursleiter_nachname ?? ''}`.trim() || null;
  }

  // Helper to get participant count for a course
  function getParticipantCount(courseId: string): number {
    return participantsByCourseId.get(courseId)?.length ?? 0;
  }

  // Helper to get participant names for a course
  function getParticipantNames(courseId: string): string[] {
    const ps = participantsByCourseId.get(courseId) ?? [];
    return ps.map(
      (p) =>
        `${p.fields.teilnehmer_vorname ?? ''} ${p.fields.teilnehmer_nachname ?? ''}`.trim(),
    );
  }

  // Get course name from a URL
  function getCourseNameFromUrl(url: string | undefined): string {
    if (!url) return '—';
    const id = extractRecordId(url);
    if (!id) return '—';
    const k = kursMap.get(id);
    return k?.fields.kurs_name ?? '—';
  }

  // Resolve participant's courses
  function getParticipantCourseNames(t: Teilnehmeranmeldung): string[] {
    const courseUrl = t.fields.angemeldete_kurse;
    if (!courseUrl) return [];
    const urls = courseUrl.includes(',') ? courseUrl.split(',').map((u) => u.trim()) : [courseUrl];
    return urls
      .map((url) => {
        const id = extractRecordId(url);
        if (!id) return null;
        return kursMap.get(id)?.fields.kurs_name ?? null;
      })
      .filter((n): n is string => n !== null);
  }

  // CRUD handlers
  async function handleDeleteKurs() {
    if (!deleteKurs) return;
    await LivingAppsService.deleteKursverwaltungEntry(deleteKurs.record_id);
    setDeleteKurs(null);
    fetchData();
  }

  async function handleDeleteTeilnehmer() {
    if (!deleteTeilnehmer) return;
    await LivingAppsService.deleteTeilnehmeranmeldungEntry(deleteTeilnehmer.record_id);
    setDeleteTeilnehmer(null);
    fetchData();
  }

  async function handleDeleteKursleiter() {
    if (!deleteKursleiter) return;
    await LivingAppsService.deleteKursleiterzuordnungEntry(deleteKursleiter.record_id);
    setDeleteKursleiter(null);
    fetchData();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Yoga Studio</h1>
            <p className="text-sm text-muted-foreground font-light">Kurs Management</p>
          </div>
          <Button
            onClick={() => {
              setEditKurs(null);
              setShowKursDialog(true);
            }}
            className="rounded-full px-5 hidden md:flex"
          >
            <Plus className="h-4 w-4 mr-1" /> Neuen Kurs erstellen
          </Button>
          <Button
            onClick={() => {
              setEditKurs(null);
              setShowKursDialog(true);
            }}
            className="rounded-full px-4 md:hidden"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Neuer Kurs
          </Button>
        </div>

        {/* ===== Stats Row (full width) ===== */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow duration-200 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Aktive Kurse
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{kurse.length}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Kursleiter
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{kursleiter.length}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Teilnehmer
              </CardTitle>
              <UserPlus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{teilnehmer.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* ===== Main Content: Desktop 65/35 split ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.54fr] gap-8">
          {/* ----- Left Column ----- */}
          <div className="space-y-8">
            {/* Nächste Kurse (Hero) */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Nächste Kurse</h2>
              </div>

              {sortedKurse.length === 0 ? (
                <EmptyCourseState
                  onCreate={() => {
                    setEditKurs(null);
                    setShowKursDialog(true);
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {sortedKurse.map((k, idx) => {
                    const instructorName = getInstructorName(k.record_id);
                    const participantCount = getParticipantCount(k.record_id);
                    const todayClass = isToday(k.fields.kurs_zeitplan);
                    const upcoming = isTodayOrFuture(k.fields.kurs_zeitplan);

                    return (
                      <div
                        key={k.record_id}
                        className="flex rounded-xl bg-card border shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer overflow-hidden"
                        style={{
                          animationDelay: `${idx * 50}ms`,
                        }}
                        onClick={() => setDetailKurs(k)}
                      >
                        {/* Sage green accent bar */}
                        <div
                          className={`w-1 shrink-0 ${
                            todayClass
                              ? 'bg-primary animate-pulse'
                              : upcoming
                                ? 'bg-primary'
                                : 'bg-muted-foreground/30'
                          }`}
                        />
                        <div className="flex-1 p-4 md:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-base truncate">
                                {k.fields.kurs_name || 'Unbenannter Kurs'}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-light flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatDateShort(k.fields.kurs_zeitplan)},{' '}
                                  {formatTime(k.fields.kurs_zeitplan)} Uhr
                                </span>
                                {k.fields.kurs_ort && (
                                  <Badge variant="secondary" className="text-xs font-normal">
                                    <MapPin className="h-3 w-3 mr-0.5" />
                                    {k.fields.kurs_ort}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {instructorName && (
                                <span className="text-xs text-muted-foreground">
                                  {instructorName}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {participantCount} Teiln.
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Teilnehmer Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Teilnehmer</h2>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditTeilnehmer(null);
                    setShowTeilnehmerDialog(true);
                  }}
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </div>

              {sortedTeilnehmer.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <UserPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>Noch keine Teilnehmer vorhanden.</p>
                </div>
              ) : (
                <>
                  {/* Desktop: Table */}
                  <div className="hidden md:block border rounded-xl overflow-hidden bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Kurse</TableHead>
                          <TableHead className="w-24 text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedTeilnehmer.map((t) => {
                          const courseNames = getParticipantCourseNames(t);
                          return (
                            <TableRow key={t.record_id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                {t.fields.teilnehmer_vorname}{' '}
                                {t.fields.teilnehmer_nachname}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {t.fields.teilnehmer_email || '—'}
                              </TableCell>
                              <TableCell>
                                {courseNames.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {courseNames.map((name, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {name}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setEditTeilnehmer(t);
                                      setShowTeilnehmerDialog(true);
                                    }}
                                    aria-label="Bearbeiten"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteTeilnehmer(t)}
                                    aria-label="Löschen"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile: List */}
                  <div className="md:hidden space-y-0 divide-y border rounded-xl overflow-hidden bg-card">
                    {sortedTeilnehmer.map((t) => (
                      <div
                        key={t.record_id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {t.fields.teilnehmer_vorname} {t.fields.teilnehmer_nachname}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {t.fields.teilnehmer_email || 'Keine E-Mail'}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => {
                              setEditTeilnehmer(t);
                              setShowTeilnehmerDialog(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTeilnehmer(t)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>

          {/* ----- Right Column (Kursleiter) ----- */}
          <div>
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Kursleiter</h2>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditKursleiter(null);
                    setShowKursleiterDialog(true);
                  }}
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </div>

              {sortedKursleiter.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>Noch keine Kursleiter vorhanden.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedKursleiter.map((kl) => {
                    const courseName = getCourseNameFromUrl(kl.fields.zugewiesener_kurs);
                    return (
                      <Card
                        key={kl.record_id}
                        className="hover:shadow-md transition-shadow duration-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm">
                                {kl.fields.kursleiter_vorname}{' '}
                                {kl.fields.kursleiter_nachname}
                              </div>
                              {kl.fields.kursleiter_kontakt && (
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {kl.fields.kursleiter_kontakt}
                                </div>
                              )}
                              {courseName !== '—' && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {courseName}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditKursleiter(kl);
                                  setShowKursleiterDialog(true);
                                }}
                                aria-label="Bearbeiten"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteKursleiter(kl)}
                                aria-label="Löschen"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* ===== All Dialogs ===== */}

      {/* Kurs Create/Edit Dialog */}
      <KursDialog
        open={showKursDialog}
        onOpenChange={(open) => {
          setShowKursDialog(open);
          if (!open) setEditKurs(null);
        }}
        kurs={editKurs}
        onSuccess={fetchData}
      />

      {/* Kurs Detail Dialog */}
      {detailKurs && (
        <KursDetailDialog
          open={!!detailKurs}
          onOpenChange={(open) => !open && setDetailKurs(null)}
          kurs={detailKurs}
          instructorName={getInstructorName(detailKurs.record_id)}
          participantCount={getParticipantCount(detailKurs.record_id)}
          participants={getParticipantNames(detailKurs.record_id)}
          onEdit={() => {
            setDetailKurs(null);
            setEditKurs(detailKurs);
            setShowKursDialog(true);
          }}
          onDelete={() => {
            setDetailKurs(null);
            setDeleteKurs(detailKurs);
          }}
        />
      )}

      {/* Kurs Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteKurs}
        onOpenChange={(open) => !open && setDeleteKurs(null)}
        recordName={deleteKurs?.fields.kurs_name ?? 'Kurs'}
        onConfirm={handleDeleteKurs}
      />

      {/* Teilnehmer Create/Edit Dialog */}
      <TeilnehmerDialog
        open={showTeilnehmerDialog}
        onOpenChange={(open) => {
          setShowTeilnehmerDialog(open);
          if (!open) setEditTeilnehmer(null);
        }}
        teilnehmer={editTeilnehmer}
        kurse={kurse}
        onSuccess={fetchData}
      />

      {/* Teilnehmer Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTeilnehmer}
        onOpenChange={(open) => !open && setDeleteTeilnehmer(null)}
        recordName={
          deleteTeilnehmer
            ? `${deleteTeilnehmer.fields.teilnehmer_vorname ?? ''} ${deleteTeilnehmer.fields.teilnehmer_nachname ?? ''}`.trim()
            : ''
        }
        onConfirm={handleDeleteTeilnehmer}
      />

      {/* Kursleiter Create/Edit Dialog */}
      <KursleiterDialog
        open={showKursleiterDialog}
        onOpenChange={(open) => {
          setShowKursleiterDialog(open);
          if (!open) setEditKursleiter(null);
        }}
        kursleiter={editKursleiter}
        kurse={kurse}
        onSuccess={fetchData}
      />

      {/* Kursleiter Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteKursleiter}
        onOpenChange={(open) => !open && setDeleteKursleiter(null)}
        recordName={
          deleteKursleiter
            ? `${deleteKursleiter.fields.kursleiter_vorname ?? ''} ${deleteKursleiter.fields.kursleiter_nachname ?? ''}`.trim()
            : ''
        }
        onConfirm={handleDeleteKursleiter}
      />
    </div>
  );
}
