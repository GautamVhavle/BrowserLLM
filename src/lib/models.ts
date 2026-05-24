/**
 * Public model API, re-exports from the full catalog.
 *
 * Components import from here rather than `modelCatalog.ts` directly,
 * so the catalog implementation can be swapped without touching consumers.
 */
import {
  MODEL_CATALOG,
  DEFAULT_MODEL_ID as CATALOG_DEFAULT,
  getCatalogModel,
  type CatalogModel,
} from "./modelCatalog";

export type ModelConfig = CatalogModel;

export const AVAILABLE_MODELS = MODEL_CATALOG;

export const DEFAULT_MODEL_ID = CATALOG_DEFAULT;

export function getModelById(id: string): ModelConfig | undefined {
  return getCatalogModel(id);
}
