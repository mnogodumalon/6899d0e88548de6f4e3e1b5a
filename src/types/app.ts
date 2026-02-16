// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Teilnehmeranmeldung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    teilnehmer_vorname?: string;
    teilnehmer_nachname?: string;
    teilnehmer_email?: string;
    angemeldete_kurse?: string;
  };
}

export interface Kursleiterzuordnung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kursleiter_vorname?: string;
    kursleiter_nachname?: string;
    kursleiter_kontakt?: string;
    zugewiesener_kurs?: string; // applookup -> URL zu 'Kursverwaltung' Record
  };
}

export interface Kursverwaltung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kurs_name?: string;
    kurs_beschreibung?: string;
    kurs_zeitplan?: string; // Format: YYYY-MM-DD oder ISO String
    kurs_ort?: string;
  };
}

export const APP_IDS = {
  TEILNEHMERANMELDUNG: '6899d0d7ab6cda2d36ea30f4',
  KURSLEITERZUORDNUNG: '6899d0d63370f71550c5aea6',
  KURSVERWALTUNG: '6899d0d3ca4dc3817f92802b',
} as const;

// Helper Types for creating new records
export type CreateTeilnehmeranmeldung = Teilnehmeranmeldung['fields'];
export type CreateKursleiterzuordnung = Kursleiterzuordnung['fields'];
export type CreateKursverwaltung = Kursverwaltung['fields'];