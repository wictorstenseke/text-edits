export interface Tag {
  key: string;
  label: string;
  value: string;
}

export interface FinancialReportColumn {
  id: string;
  label: string;
}

export interface FinancialReportRow {
  id: string;
  accountNumber: string;
  accountName: string;
  values: Record<string, string>; // columnId -> value
}

export interface FinancialReportBlock {
  id: string;
  columns: FinancialReportColumn[];
  rows: FinancialReportRow[];
  showTotals: boolean;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  content: string; // JSON string from TipTap editor
}

export interface Document {
  id: string;
  title: string;
  sections: Section[];
  tagValues: Record<string, string>; // key -> value mapping
}

export interface TemplateSection {
  title: string;
  content?: string;
}

export interface Template {
  id: string;
  name: string;
  sections: TemplateSection[];
}
