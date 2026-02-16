// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Teilnehmeranmeldung, Kursleiterzuordnung, Kursverwaltung } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://ci04.ci.xist4c.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://ci04.ci.xist4c.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- TEILNEHMERANMELDUNG ---
  static async getTeilnehmeranmeldung(): Promise<Teilnehmeranmeldung[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.TEILNEHMERANMELDUNG}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getTeilnehmeranmeldungEntry(id: string): Promise<Teilnehmeranmeldung | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.TEILNEHMERANMELDUNG}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createTeilnehmeranmeldungEntry(fields: Teilnehmeranmeldung['fields']) {
    return callApi('POST', `/apps/${APP_IDS.TEILNEHMERANMELDUNG}/records`, { fields });
  }
  static async updateTeilnehmeranmeldungEntry(id: string, fields: Partial<Teilnehmeranmeldung['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.TEILNEHMERANMELDUNG}/records/${id}`, { fields });
  }
  static async deleteTeilnehmeranmeldungEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.TEILNEHMERANMELDUNG}/records/${id}`);
  }

  // --- KURSLEITERZUORDNUNG ---
  static async getKursleiterzuordnung(): Promise<Kursleiterzuordnung[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KURSLEITERZUORDNUNG}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getKursleiterzuordnungEntry(id: string): Promise<Kursleiterzuordnung | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KURSLEITERZUORDNUNG}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createKursleiterzuordnungEntry(fields: Kursleiterzuordnung['fields']) {
    return callApi('POST', `/apps/${APP_IDS.KURSLEITERZUORDNUNG}/records`, { fields });
  }
  static async updateKursleiterzuordnungEntry(id: string, fields: Partial<Kursleiterzuordnung['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.KURSLEITERZUORDNUNG}/records/${id}`, { fields });
  }
  static async deleteKursleiterzuordnungEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.KURSLEITERZUORDNUNG}/records/${id}`);
  }

  // --- KURSVERWALTUNG ---
  static async getKursverwaltung(): Promise<Kursverwaltung[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KURSVERWALTUNG}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getKursverwaltungEntry(id: string): Promise<Kursverwaltung | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KURSVERWALTUNG}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createKursverwaltungEntry(fields: Kursverwaltung['fields']) {
    return callApi('POST', `/apps/${APP_IDS.KURSVERWALTUNG}/records`, { fields });
  }
  static async updateKursverwaltungEntry(id: string, fields: Partial<Kursverwaltung['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.KURSVERWALTUNG}/records/${id}`, { fields });
  }
  static async deleteKursverwaltungEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.KURSVERWALTUNG}/records/${id}`);
  }

}