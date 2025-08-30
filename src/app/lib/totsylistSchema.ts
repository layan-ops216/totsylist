export const totsylistJsonSchema = {
  name: "totsylist_schema",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: {
        type: "object",
        additionalProperties: false,
        properties: {
          due_date: { type: "string" },
          budget: { enum: ["budget", "midtier", "premium"] },
          key_prefs: { type: "array", items: { type: "string" } },
          disclaimers: { type: "array", items: { type: "string" } }
        },
        required: ["due_date", "budget", "key_prefs", "disclaimers"]
      },
      categories: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            category: {
              enum: [
                "Feeding","Diapering","Travel","Nursery","Bath",
                "Health & Safety","Clothing","Play","Postpartum"
              ]
            },
            priority: { enum: ["essential", "nice_to_have"] },
            items: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  brand: { type: "string" },
                  url: { type: "string" },
                  est_price_usd: { type: "number" },
                  why: { type: "string" },
                  eco_friendly: { type: "boolean" },
                  age_range: { type: "string" },
                  notes: { type: "string" }
                },
                required: ["name", "why", "eco_friendly"]
              }
            }
          },
          required: ["category", "priority", "items"]
        }
      }
    },
    required: ["summary", "categories"]
  },
  strict: true
} as const;