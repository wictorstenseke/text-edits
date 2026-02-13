import type { Document } from "@/types/document";


export const getSwedishAnnualReportDocument = (): Document => ({
  id: "annual-report-2025",
  title: "Årsredovisning 2025",
  sections: [
    {
      id: "cover-page",
      title: "Framsida / Titelsida",
      order: 0,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              {
                type: "mention",
                attrs: { id: "CompanyName", label: "Acme AB" },
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Årsredovisning 2025" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Rapportperiod: 1 januari 2025 – 31 december 2025",
              },
            ],
          },
        ],
      }),
    },
    {
      id: "ceo-letter",
      title: "Brev till aktieägarna / VD:s uttalande",
      order: 1,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Bästa aktieägare," }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Jag är glad att kunna presentera vår årsredovisning för räkenskapsåret 2025. Detta år har präglats av betydande framsteg och stadiga framsteg mot våra strategiska mål.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Viktiga prestationer" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Intäktstillväxt på 15% jämfört med föregående år",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Expansion till tre nya marknader",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Lansering av innovativ produktlinje",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Framtidsutsikter" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Framåtblickande förblir vi engagerade i att leverera värde till våra aktieägare samtidigt som vi investerar i hållbara tillväxtinitiativ. Vår vision är att bli branschledare senast 2030.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Vänliga hälsningar," }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", marks: [{ type: "bold" }], text: "VD Namn" },
              { type: "hardBreak" },
              { type: "text", text: "Verkställande direktör" },
            ],
          },
        ],
      }),
    },
    {
      id: "company-overview",
      title: "Företagsöversikt",
      order: 2,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Verksamhetsbeskrivning" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "mention",
                attrs: { id: "CompanyName", label: "Acme AB" },
              },
              {
                type: "text",
                text: " är en ledande leverantör av innovativa lösningar inom tekniksektorn. Grundat 2010 har vi vuxit till att betjäna kunder i över 50 länder världen över.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Marknader & Strategi" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Vårt strategiska fokus inkluderar att expandera vår marknadsnärvaro i Nordamerika, Europa och Asien-Stillahavsområdet. Vi fortsätter att investera i forskning och utveckling för att behålla vår konkurrensfördel.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Nyckelprodukter & Tjänster" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Företagsplattform",
                      },
                      {
                        type: "text",
                        text: " – Molnbaserad företagsledningslösning",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Analyssvit",
                      },
                      {
                        type: "text",
                        text: " – Datadrivna insikter och rapporteringsverktyg",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Professionella tjänster",
                      },
                      {
                        type: "text",
                        text: " – Implementering och konsulttjänster",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
    {
      id: "mda-section",
      title: "Ledningens diskussion & analys",
      order: 3,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Operativa resultat" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Räkenskapsåret 2025 visade stark operativ prestation. Intäkterna ökade med 15% jämfört med föregående år, drivet av tillväxt i våra kärnproduktlinjer och framgångsrika marknadsexpansionsinitiativ.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Utmaningar & möjligheter" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Även om vi mötte utmaningar från ökad konkurrens och störningar i leveranskedjan, utnyttjade vi möjligheter på tillväxtmarknader. Vår smidiga respons på marknadsförhållandena positionerade oss väl för fortsatt tillväxt.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Viktiga beslut" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Strategiskt förvärv av TechCo Inc. för att utöka kapaciteten",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Investering av 50M SEK i FoU-initiativ",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Implementering av hållbarhetsprogram över verksamheten",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
    {
      id: "highlights",
      title: "Höjdpunkter / Nyckeltal",
      order: 4,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Viktiga prestationsindikatorer för räkenskapsåret 2025:",
              },
            ],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Intäkter: ",
                      },
                      { type: "text", text: "125,000,000 SEK (+15% YoY)" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Nettoresultat: ",
                      },
                      { type: "text", text: "18,750,000 SEK (+12% YoY)" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Bruttomarginal: ",
                      },
                      { type: "text", text: "42.5%" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Kundbas: ",
                      },
                      { type: "text", text: "2,500+ aktiva kunder" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Antal anställda: ",
                      },
                      { type: "text", text: "450 heltidsanställda" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
    {
      id: "financial-statements",
      title: "Finansiella rapporter",
      order: 5,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Balansräkning" }],
          },
          {
            type: "financialReportBlock",
            attrs: {
              leftColumns: [
                { id: "bs-account", label: "Konto", align: "left" },
              ],
              rightColumns: [
                { id: "bs-2025", label: "2025 (SEK)", align: "right" },
                { id: "bs-2024", label: "2024 (SEK)", align: "right" },
              ],
              rows: [
                {
                  id: "bs-row-1",
                  values: {
                    "bs-account": "Tillgångar",
                    "bs-2025": "",
                    "bs-2024": "",
                  },
                },
                {
                  id: "bs-row-2",
                  values: {
                    "bs-account": "  Omsättningstillgångar",
                    "bs-2025": "45,000,000",
                    "bs-2024": "38,000,000",
                  },
                },
                {
                  id: "bs-row-3",
                  values: {
                    "bs-account": "  Anläggningstillgångar",
                    "bs-2025": "80,000,000",
                    "bs-2024": "72,000,000",
                  },
                },
                {
                  id: "bs-row-4",
                  values: {
                    "bs-account": "Summa tillgångar",
                    "bs-2025": "125,000,000",
                    "bs-2024": "110,000,000",
                  },
                },
                {
                  id: "bs-row-5",
                  values: { "bs-account": "", "bs-2025": "", "bs-2024": "" },
                },
                {
                  id: "bs-row-6",
                  values: {
                    "bs-account": "Skulder & Eget kapital",
                    "bs-2025": "",
                    "bs-2024": "",
                  },
                },
                {
                  id: "bs-row-7",
                  values: {
                    "bs-account": "  Kortfristiga skulder",
                    "bs-2025": "25,000,000",
                    "bs-2024": "22,000,000",
                  },
                },
                {
                  id: "bs-row-8",
                  values: {
                    "bs-account": "  Långfristiga skulder",
                    "bs-2025": "30,000,000",
                    "bs-2024": "28,000,000",
                  },
                },
                {
                  id: "bs-row-9",
                  values: {
                    "bs-account": "  Eget kapital",
                    "bs-2025": "70,000,000",
                    "bs-2024": "60,000,000",
                  },
                },
                {
                  id: "bs-row-10",
                  values: {
                    "bs-account": "Summa skulder & Eget kapital",
                    "bs-2025": "125,000,000",
                    "bs-2024": "110,000,000",
                  },
                },
              ],
              showTotals: false,
            },
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Resultaträkning" }],
          },
          {
            type: "financialReportBlock",
            attrs: {
              leftColumns: [
                { id: "is-account", label: "Konto", align: "left" },
              ],
              rightColumns: [
                { id: "is-2025", label: "2025 (SEK)", align: "right" },
                { id: "is-2024", label: "2024 (SEK)", align: "right" },
              ],
              rows: [
                {
                  id: "is-row-1",
                  values: {
                    "is-account": "Intäkter",
                    "is-2025": "125,000,000",
                    "is-2024": "108,700,000",
                  },
                },
                {
                  id: "is-row-2",
                  values: {
                    "is-account": "Kostnad för sålda varor",
                    "is-2025": "-71,875,000",
                    "is-2024": "-65,220,000",
                  },
                },
                {
                  id: "is-row-3",
                  values: {
                    "is-account": "Bruttovinst",
                    "is-2025": "53,125,000",
                    "is-2024": "43,480,000",
                  },
                },
                {
                  id: "is-row-4",
                  values: {
                    "is-account": "Rörelsekostnader",
                    "is-2025": "-28,000,000",
                    "is-2024": "-24,000,000",
                  },
                },
                {
                  id: "is-row-5",
                  values: {
                    "is-account": "Rörelseresultat",
                    "is-2025": "25,125,000",
                    "is-2024": "19,480,000",
                  },
                },
                {
                  id: "is-row-6",
                  values: {
                    "is-account": "Räntekostnader",
                    "is-2025": "-1,500,000",
                    "is-2024": "-1,200,000",
                  },
                },
                {
                  id: "is-row-7",
                  values: {
                    "is-account": "Resultat före skatt",
                    "is-2025": "23,625,000",
                    "is-2024": "18,280,000",
                  },
                },
                {
                  id: "is-row-8",
                  values: {
                    "is-account": "Inkomstskatt",
                    "is-2025": "-4,875,000",
                    "is-2024": "-3,560,000",
                  },
                },
                {
                  id: "is-row-9",
                  values: {
                    "is-account": "Nettoresultat",
                    "is-2025": "18,750,000",
                    "is-2024": "14,720,000",
                  },
                },
              ],
              showTotals: false,
            },
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Kassaflödesanalys" }],
          },
          {
            type: "financialReportBlock",
            attrs: {
              leftColumns: [
                { id: "cf-account", label: "Konto", align: "left" },
              ],
              rightColumns: [
                { id: "cf-2025", label: "2025 (SEK)", align: "right" },
                { id: "cf-2024", label: "2024 (SEK)", align: "right" },
              ],
              rows: [
                {
                  id: "cf-row-1",
                  values: {
                    "cf-account": "Den löpande verksamheten",
                    "cf-2025": "",
                    "cf-2024": "",
                  },
                },
                {
                  id: "cf-row-2",
                  values: {
                    "cf-account": "  Nettoresultat",
                    "cf-2025": "18,750,000",
                    "cf-2024": "14,720,000",
                  },
                },
                {
                  id: "cf-row-3",
                  values: {
                    "cf-account": "  Avskrivningar",
                    "cf-2025": "5,000,000",
                    "cf-2024": "4,500,000",
                  },
                },
                {
                  id: "cf-row-4",
                  values: {
                    "cf-account": "  Förändringar i rörelsekapital",
                    "cf-2025": "-2,000,000",
                    "cf-2024": "-1,500,000",
                  },
                },
                {
                  id: "cf-row-5",
                  values: {
                    "cf-account": "Kassaflöde från den löpande verksamheten",
                    "cf-2025": "21,750,000",
                    "cf-2024": "17,720,000",
                  },
                },
                {
                  id: "cf-row-6",
                  values: { "cf-account": "", "cf-2025": "", "cf-2024": "" },
                },
                {
                  id: "cf-row-7",
                  values: {
                    "cf-account": "Investeringsverksamheten",
                    "cf-2025": "",
                    "cf-2024": "",
                  },
                },
                {
                  id: "cf-row-8",
                  values: {
                    "cf-account": "  Investeringar i anläggningstillgångar",
                    "cf-2025": "-8,000,000",
                    "cf-2024": "-6,000,000",
                  },
                },
                {
                  id: "cf-row-9",
                  values: {
                    "cf-account": "  Förvärv",
                    "cf-2025": "-5,000,000",
                    "cf-2024": "0",
                  },
                },
                {
                  id: "cf-row-10",
                  values: {
                    "cf-account": "Kassaflöde från investeringsverksamheten",
                    "cf-2025": "-13,000,000",
                    "cf-2024": "-6,000,000",
                  },
                },
                {
                  id: "cf-row-11",
                  values: { "cf-account": "", "cf-2025": "", "cf-2024": "" },
                },
                {
                  id: "cf-row-12",
                  values: {
                    "cf-account": "Finansieringsverksamheten",
                    "cf-2025": "",
                    "cf-2024": "",
                  },
                },
                {
                  id: "cf-row-13",
                  values: {
                    "cf-account": "  Amortering av skulder",
                    "cf-2025": "-2,000,000",
                    "cf-2024": "-2,000,000",
                  },
                },
                {
                  id: "cf-row-14",
                  values: {
                    "cf-account": "  Utbetalda utdelningar",
                    "cf-2025": "-4,000,000",
                    "cf-2024": "-3,500,000",
                  },
                },
                {
                  id: "cf-row-15",
                  values: {
                    "cf-account": "Kassaflöde från finansieringsverksamheten",
                    "cf-2025": "-6,000,000",
                    "cf-2024": "-5,500,000",
                  },
                },
                {
                  id: "cf-row-16",
                  values: { "cf-account": "", "cf-2025": "", "cf-2024": "" },
                },
                {
                  id: "cf-row-17",
                  values: {
                    "cf-account": "Förändring i likvida medel",
                    "cf-2025": "2,750,000",
                    "cf-2024": "6,220,000",
                  },
                },
              ],
              showTotals: false,
            },
          },
        ],
      }),
    },
    {
      id: "notes-section",
      title: "Noter / Förklaringar",
      order: 6,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Not 1: Redovisningsprinciper" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "De finansiella rapporterna har upprättats i enlighet med Bokföringsnämndens allmänna råd (K3). Intäkter redovisas när tjänster levereras eller produkter skickas till kunder.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Not 2: Väsentliga händelser" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Under 2025 genomförde bolaget förvärvet av TechCo Inc. för 5,000,000 SEK, vilket stärker vår position på företagsprogramvarumarknaden. Detta förvärv förväntas bidra med ytterligare 10,000,000 SEK i intäkter under räkenskapsåret 2026.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Not 3: Närståendetransaktioner" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Det förekom inga väsentliga närståendetransaktioner under rapportperioden som skulle kräva särskild redovisning.",
              },
            ],
          },
        ],
      }),
    },
    {
      id: "outlook-section",
      title: "Utsikter & mål för nästa år",
      order: 7,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Strategiska prioriteringar" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Expandera marknadsnärvaro i Asien-Stillahavsområdet",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Lansera nästa generations Företagsplattform 3.0",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Uppnå koldioxidneutralitet i verksamheten",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Förbättra kundframgångsprogram",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Målvärden för 2026" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Intäktsmål: ",
                      },
                      { type: "text", text: "145,000,000 SEK (+16% tillväxt)" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Nettovinstmarginal: ",
                      },
                      { type: "text", text: "16% (upp från 15%)" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Kundtillväxt: ",
                      },
                      { type: "text", text: "500+ nya kunder" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Anställningstillväxt: ",
                      },
                      { type: "text", text: "Expandera till 550 anställda" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
    {
      id: "appendices",
      title: "Bilagor / Ytterligare information",
      order: 8,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Bilaga A: Styrelse" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Anna Svensson",
                      },
                      { type: "text", text: " – Ordförande" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Erik Johansson",
                      },
                      { type: "text", text: " – Styrelseledamot" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Maria Lindberg",
                      },
                      { type: "text", text: " – Styrelseledamot" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Bilaga B: Företagsinformation" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [{ type: "bold" }],
                text: "Registrerat namn: ",
              },
              {
                type: "mention",
                attrs: { id: "CompanyName", label: "Acme AB" },
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [{ type: "bold" }],
                text: "Organisationsnummer: ",
              },
              {
                type: "mention",
                attrs: { id: "OrgNumber", label: "556xxx-xxxx" },
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [{ type: "bold" }],
                text: "Säte: ",
              },
              { type: "text", text: "Stockholm, Sverige" },
            ],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", marks: [{ type: "bold" }], text: "Kontakt: " },
              {
                type: "mention",
                attrs: { id: "ContactEmail", label: "info@acme.se" },
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Bilaga C: Revisorsutlåtande" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Denna årsredovisning har granskats av [Revisionsbyråns namn]. Den fullständiga revisionsberättelsen finns tillgänglig på begäran.",
              },
            ],
          },
        ],
      }),
    },
  ],
  tagValues: {
    CompanyName: "Acme AB",
    OrgNumber: "556xxx-xxxx",
    ContactEmail: "info@acme.se",
  },
});
