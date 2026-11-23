import { brand, category, finish, material } from "./documents/taxonomy";
import { catalogFile, faq, page, project } from "./documents/content";
import { homePage, siteSettings } from "./documents/singletons";
import { product } from "./documents/product";
import { altImage, decorativeImage } from "./objects/altImage";
import { dayHours, specialDay } from "./objects/hours";
import { localeBlocks, localeString, localeText } from "./objects/localized";
import { specRow, variant } from "./objects/variant";

export const schemaTypes = [
  // objects
  localeString,
  localeText,
  localeBlocks,
  altImage,
  decorativeImage,
  dayHours,
  specialDay,
  variant,
  specRow,
  // documents
  product,
  category,
  brand,
  finish,
  material,
  project,
  catalogFile,
  faq,
  page,
  siteSettings,
  homePage,
];
