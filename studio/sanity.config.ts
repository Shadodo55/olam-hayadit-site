import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { API_VERSION, SINGLETONS } from "./lib/constants";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const singletonTypes = new Set<string>(SINGLETONS);

export default defineConfig({
  name: "default",
  title: "עולם הידית והפרזול – ניהול",
  projectId: "gntr6ikv",
  dataset: "production",

  plugins: [
    structureTool({ title: "תוכן", structure }),
    // GROQ query playground, for developers only.
    visionTool({ title: "שאילתות (למפתחים)", defaultApiVersion: API_VERSION }),
  ],

  schema: {
    types: schemaTypes,
    // Singletons can't be created from the "+" menu.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Singletons: no duplicate / delete / unpublish.
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? actions.filter(
            ({ action }) =>
              action &&
              ["publish", "discardChanges", "restore"].includes(action),
          )
        : actions,
  },
});
