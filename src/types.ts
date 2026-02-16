/** Brand metadata. Only `name` is required. */
export interface BrandspecMeta {
  name: string;
  version?: string;
  updated?: string;
  description?: string;
  url?: string;
  [key: string]: unknown;
}

export interface BrandspecVoice {
  tone?: string[];
  principles?: string[];
  [key: string]: unknown;
}

export interface BrandspecCore {
  essence?: string;
  tagline?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  personality?: string[];
  voice?: BrandspecVoice;
  [key: string]: unknown;
}

/** W3C DTCG-compliant design token. */
export interface DesignToken {
  $value: string;
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BrandspecTokens {
  colors?: Record<string, DesignToken>;
  typography?: Record<string, DesignToken>;
  spacing?: Record<string, DesignToken>;
  radius?: Record<string, DesignToken>;
  [key: string]: Record<string, DesignToken> | undefined;
}

export interface BrandspecAsset {
  file: string;
  id?: string;
  role?: string;
  variant?: string;
  context?: string;
  description?: string;
  formats?: Array<{ path: string; width?: number; height?: number }>;
  tags?: string[];
  [key: string]: unknown;
}

export interface GuidelineRule {
  id?: string;
  description: string;
  severity: "info" | "warning" | "error";
  criteria?: string[];
  applies_to?: string;
  [key: string]: unknown;
}

export interface GuidelineSection {
  content?: string;
  rules?: GuidelineRule[];
  [key: string]: unknown;
}

export interface BrandspecYaml {
  meta: BrandspecMeta;
  core?: BrandspecCore;
  tokens?: BrandspecTokens;
  assets?: BrandspecAsset[];
  guidelines?: Record<string, GuidelineSection>;
  extensions?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ParseResult {
  success: boolean;
  data?: BrandspecYaml;
  errors: string[];
  warnings: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
