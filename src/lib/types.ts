// Core CRM record shape that every uploaded CSV gets normalized into.
export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CrmStatus | "";
  crm_note: string;
  data_source: DataSource | "";
  possession_time: string;
  description: string;
}

export type CrmStatus =
  | "GOOD_LEAD_FOLLOW_UP"
  | "DID_NOT_CONNECT"
  | "BAD_LEAD"
  | "SALE_DONE";

export type DataSource =
  | "leads_on_demand"
  | "meridian_tower"
  | "eden_park"
  | "varah_swamy"
  | "sarjapur_plots";

export const CRM_STATUS_VALUES: CrmStatus[] = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
];

export const DATA_SOURCE_VALUES: DataSource[] = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];

export const CRM_FIELDS: (keyof CrmRecord)[] = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
];

// A raw row straight out of PapaParse, before any AI touches it.
export type RawCsvRow = Record<string, string>;

export interface SkippedRecord {
  row: RawCsvRow;
  reason: string;
}

export interface ExtractRequestBody {
  rows: RawCsvRow[];
  columns: string[];
}

export interface ExtractResponseBody {
  records: CrmRecord[];
  skipped: SkippedRecord[];
  totalReceived: number;
  totalImported: number;
  totalSkipped: number;
  batches: number;
  fieldMapping?: Record<string, string>;
}

export interface BatchProgress {
  batchIndex: number;
  totalBatches: number;
  status: "pending" | "processing" | "done" | "retrying" | "failed";
}
