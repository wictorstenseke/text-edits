import i18n from "@/lib/i18n";
import { EMPTY_SECTION_CONTENT, normalizeSections } from "@/lib/sectionHierarchy";

import type { Document, Section, Template } from "@/types/document";

const STORAGE_KEY = "document-editor-state";

export const getEnglishAnnualReportDocument = (): Document => ({
  id: "annual-report-2025",
  title: "Annual Report 2025",
  sections: [
    {
      id: "cover-page",
      title: "Cover / Title Page",
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
            content: [{ type: "text", text: "Annual Report 2025" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Reporting Period: January 1, 2025 – December 31, 2025",
              },
            ],
          },
        ],
      }),
    },
    {
      id: "ceo-letter",
      title: "Letter to Shareholders / CEO Statement",
      order: 1,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Dear Shareholders," }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "I am pleased to present our Annual Report for fiscal year 2025. This year has been marked by significant achievements and steady progress toward our strategic goals.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Key Achievements" }],
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
                        text: "Revenue growth of 15% year-over-year",
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
                        text: "Expansion into three new markets",
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
                        text: "Launch of innovative product line",
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
            content: [{ type: "text", text: "Future Outlook" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Looking ahead, we remain committed to delivering value to our shareholders while investing in sustainable growth initiatives. Our vision is to become the industry leader by 2030.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Sincerely," }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", marks: [{ type: "bold" }], text: "CEO Name" },
              { type: "hardBreak" },
              { type: "text", text: "Chief Executive Officer" },
            ],
          },
        ],
      }),
    },
    {
      id: "company-overview",
      title: "Company Overview",
      order: 2,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Business Description" }],
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
                text: " is a leading provider of innovative solutions in the technology sector. Founded in 2010, we have grown to serve customers in over 50 countries worldwide.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Markets & Strategy" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Our strategic focus includes expanding our market presence in North America, Europe, and Asia-Pacific regions. We continue to invest in research and development to maintain our competitive edge.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Key Products & Services" }],
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
                        text: "Enterprise Platform",
                      },
                      {
                        type: "text",
                        text: " – Cloud-based business management solution",
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
                        text: "Analytics Suite",
                      },
                      {
                        type: "text",
                        text: " – Data-driven insights and reporting tools",
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
                        text: "Professional Services",
                      },
                      {
                        type: "text",
                        text: " – Implementation and consulting services",
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
      title: "Management's Discussion & Analysis",
      order: 3,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Operational Results" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Fiscal year 2025 demonstrated strong operational performance. Revenue increased by 15% compared to the prior year, driven by growth in our core product lines and successful market expansion initiatives.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Challenges & Opportunities" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "While we faced challenges from increased competition and supply chain disruptions, we capitalized on opportunities in emerging markets. Our agile response to market conditions positioned us well for continued growth.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Key Decisions" }],
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
                        text: "Strategic acquisition of TechCo Inc. to expand capabilities",
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
                        text: "Investment of 50M SEK in R&D initiatives",
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
                        text: "Implementation of sustainability program across operations",
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
      title: "Highlights / Key Metrics",
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
                text: "Key performance indicators for fiscal year 2025:",
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
                        text: "Revenue: ",
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
                        text: "Net Profit: ",
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
                        text: "Gross Margin: ",
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
                        text: "Customer Base: ",
                      },
                      { type: "text", text: "2,500+ active customers" },
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
                        text: "Employee Count: ",
                      },
                      { type: "text", text: "450 full-time employees" },
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
      title: "Financial Statements",
      order: 5,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Balance Sheet" }],
          },
          {
            type: "financialReportBlock",
            attrs: {
              leftColumns: [
                { id: "bs-account", label: "Account", align: "left" },
              ],
              rightColumns: [
                { id: "bs-2025", label: "2025 (SEK)", align: "right" },
                { id: "bs-2024", label: "2024 (SEK)", align: "right" },
              ],
              rows: [
                {
                  id: "bs-row-1",
                  values: {
                    "bs-account": "Assets",
                    "bs-2025": "",
                    "bs-2024": "",
                  },
                },
                {
                  id: "bs-row-2",
                  values: {
                    "bs-account": "  Current Assets",
                    "bs-2025": "45,000,000",
                    "bs-2024": "38,000,000",
                  },
                },
                {
                  id: "bs-row-3",
                  values: {
                    "bs-account": "  Fixed Assets",
                    "bs-2025": "80,000,000",
                    "bs-2024": "72,000,000",
                  },
                },
                {
                  id: "bs-row-4",
                  values: {
                    "bs-account": "Total Assets",
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
                    "bs-account": "Liabilities & Equity",
                    "bs-2025": "",
                    "bs-2024": "",
                  },
                },
                {
                  id: "bs-row-7",
                  values: {
                    "bs-account": "  Current Liabilities",
                    "bs-2025": "25,000,000",
                    "bs-2024": "22,000,000",
                  },
                },
                {
                  id: "bs-row-8",
                  values: {
                    "bs-account": "  Long-term Debt",
                    "bs-2025": "30,000,000",
                    "bs-2024": "28,000,000",
                  },
                },
                {
                  id: "bs-row-9",
                  values: {
                    "bs-account": "  Shareholders' Equity",
                    "bs-2025": "70,000,000",
                    "bs-2024": "60,000,000",
                  },
                },
                {
                  id: "bs-row-10",
                  values: {
                    "bs-account": "Total Liabilities & Equity",
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
            content: [
              { type: "text", text: "Income Statement (Profit & Loss)" },
            ],
          },
          {
            type: "financialReportBlock",
            attrs: {
              leftColumns: [
                { id: "is-account", label: "Account", align: "left" },
              ],
              rightColumns: [
                { id: "is-2025", label: "2025 (SEK)", align: "right" },
                { id: "is-2024", label: "2024 (SEK)", align: "right" },
              ],
              rows: [
                {
                  id: "is-row-1",
                  values: {
                    "is-account": "Revenue",
                    "is-2025": "125,000,000",
                    "is-2024": "108,700,000",
                  },
                },
                {
                  id: "is-row-2",
                  values: {
                    "is-account": "Cost of Goods Sold",
                    "is-2025": "-71,875,000",
                    "is-2024": "-65,220,000",
                  },
                },
                {
                  id: "is-row-3",
                  values: {
                    "is-account": "Gross Profit",
                    "is-2025": "53,125,000",
                    "is-2024": "43,480,000",
                  },
                },
                {
                  id: "is-row-4",
                  values: {
                    "is-account": "Operating Expenses",
                    "is-2025": "-28,000,000",
                    "is-2024": "-24,000,000",
                  },
                },
                {
                  id: "is-row-5",
                  values: {
                    "is-account": "Operating Income",
                    "is-2025": "25,125,000",
                    "is-2024": "19,480,000",
                  },
                },
                {
                  id: "is-row-6",
                  values: {
                    "is-account": "Interest Expense",
                    "is-2025": "-1,500,000",
                    "is-2024": "-1,200,000",
                  },
                },
                {
                  id: "is-row-7",
                  values: {
                    "is-account": "Income Before Tax",
                    "is-2025": "23,625,000",
                    "is-2024": "18,280,000",
                  },
                },
                {
                  id: "is-row-8",
                  values: {
                    "is-account": "Income Tax",
                    "is-2025": "-4,875,000",
                    "is-2024": "-3,560,000",
                  },
                },
                {
                  id: "is-row-9",
                  values: {
                    "is-account": "Net Income",
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
            content: [{ type: "text", text: "Cash Flow Statement" }],
          },
          {
            type: "financialReportBlock",
            attrs: {
              leftColumns: [
                { id: "cf-account", label: "Account", align: "left" },
              ],
              rightColumns: [
                { id: "cf-2025", label: "2025 (SEK)", align: "right" },
                { id: "cf-2024", label: "2024 (SEK)", align: "right" },
              ],
              rows: [
                {
                  id: "cf-row-1",
                  values: {
                    "cf-account": "Operating Activities",
                    "cf-2025": "",
                    "cf-2024": "",
                  },
                },
                {
                  id: "cf-row-2",
                  values: {
                    "cf-account": "  Net Income",
                    "cf-2025": "18,750,000",
                    "cf-2024": "14,720,000",
                  },
                },
                {
                  id: "cf-row-3",
                  values: {
                    "cf-account": "  Depreciation",
                    "cf-2025": "5,000,000",
                    "cf-2024": "4,500,000",
                  },
                },
                {
                  id: "cf-row-4",
                  values: {
                    "cf-account": "  Working Capital Changes",
                    "cf-2025": "-2,000,000",
                    "cf-2024": "-1,500,000",
                  },
                },
                {
                  id: "cf-row-5",
                  values: {
                    "cf-account": "Net Cash from Operations",
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
                    "cf-account": "Investing Activities",
                    "cf-2025": "",
                    "cf-2024": "",
                  },
                },
                {
                  id: "cf-row-8",
                  values: {
                    "cf-account": "  Capital Expenditures",
                    "cf-2025": "-8,000,000",
                    "cf-2024": "-6,000,000",
                  },
                },
                {
                  id: "cf-row-9",
                  values: {
                    "cf-account": "  Acquisitions",
                    "cf-2025": "-5,000,000",
                    "cf-2024": "0",
                  },
                },
                {
                  id: "cf-row-10",
                  values: {
                    "cf-account": "Net Cash from Investing",
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
                    "cf-account": "Financing Activities",
                    "cf-2025": "",
                    "cf-2024": "",
                  },
                },
                {
                  id: "cf-row-13",
                  values: {
                    "cf-account": "  Debt Repayment",
                    "cf-2025": "-2,000,000",
                    "cf-2024": "-2,000,000",
                  },
                },
                {
                  id: "cf-row-14",
                  values: {
                    "cf-account": "  Dividends Paid",
                    "cf-2025": "-4,000,000",
                    "cf-2024": "-3,500,000",
                  },
                },
                {
                  id: "cf-row-15",
                  values: {
                    "cf-account": "Net Cash from Financing",
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
                    "cf-account": "Net Change in Cash",
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
      title: "Notes / Explanations",
      order: 6,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Note 1: Accounting Policies" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The financial statements have been prepared in accordance with Swedish Generally Accepted Accounting Principles (Swedish GAAP). Revenue is recognized when services are delivered or products are shipped to customers.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Note 2: Significant Events" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "During 2025, the company completed the acquisition of TechCo Inc. for 5,000,000 SEK, strengthening our position in the enterprise software market. This acquisition is expected to contribute an additional 10,000,000 SEK in revenue in fiscal year 2026.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [
              { type: "text", text: "Note 3: Related Party Transactions" },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "There were no material related party transactions during the reporting period that would require separate disclosure.",
              },
            ],
          },
        ],
      }),
    },
    {
      id: "outlook-section",
      title: "Outlook & Goals for Next Year",
      order: 7,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Strategic Priorities" }],
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
                        text: "Expand market presence in Asia-Pacific region",
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
                        text: "Launch next-generation Enterprise Platform 3.0",
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
                        text: "Achieve carbon neutrality in operations",
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
                        text: "Enhance customer success programs",
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
            content: [{ type: "text", text: "Target Metrics for 2026" }],
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
                        text: "Revenue Target: ",
                      },
                      { type: "text", text: "145,000,000 SEK (+16% growth)" },
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
                        text: "Net Profit Margin: ",
                      },
                      { type: "text", text: "16% (up from 15%)" },
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
                        text: "Customer Growth: ",
                      },
                      { type: "text", text: "500+ new customers" },
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
                        text: "Employee Growth: ",
                      },
                      { type: "text", text: "Expand to 550 employees" },
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
      title: "Appendices / Additional Info",
      order: 8,
      parentId: null,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Appendix A: Board of Directors" }],
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
                      { type: "text", text: " – Chairperson" },
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
                      { type: "text", text: " – Board Member" },
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
                      { type: "text", text: " – Board Member" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [
              { type: "text", text: "Appendix B: Company Information" },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [{ type: "bold" }],
                text: "Registered Name: ",
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
                text: "Organization Number: ",
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
                text: "Registered Office: ",
              },
              { type: "text", text: "Stockholm, Sweden" },
            ],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", marks: [{ type: "bold" }], text: "Contact: " },
              {
                type: "mention",
                attrs: { id: "ContactEmail", label: "info@acme.se" },
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [
              { type: "text", text: "Appendix C: Auditor's Statement" },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This annual report has been audited by [Audit Firm Name]. The complete auditor's report is available upon request.",
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
            content: [
              { type: "text", text: "Not 3: Närståendetransaktioner" },
            ],
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

export const getDefaultAnnualReportDocument = (language?: string): Document => {
  const lang = language || i18n.language;
  return lang === "sv"
    ? getSwedishAnnualReportDocument()
    : getEnglishAnnualReportDocument();
};

export const getSampleDocument = (): Document => {
  const sample = getDefaultAnnualReportDocument();
  return {
    ...sample,
    sections: normalizeSections(sample.sections),
  };
};

export const getSampleTemplates = (): Template[] => [
  {
    id: "template-1",
    name: "Basic Document",
    sections: [
      { title: "Introduction", content: "" },
      { title: "Main Content", content: "" },
      { title: "Conclusion", content: "" },
    ],
  },
  {
    id: "template-2",
    name: "Business Proposal",
    sections: [
      { title: "Executive Summary", content: "" },
      { title: "Problem Statement", content: "" },
      { title: "Proposed Solution", content: "" },
      { title: "Budget", content: "" },
      { title: "Timeline", content: "" },
      { title: "Conclusion", content: "" },
    ],
  },
];

export const loadDocument = (): Document => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the parsed object has the required Document structure
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.id === "string" &&
        typeof parsed.title === "string" &&
        Array.isArray(parsed.sections) &&
        typeof parsed.tagValues === "object" &&
        parsed.tagValues !== null
      ) {
        const normalizedSections: Section[] = parsed.sections
          .map((section: unknown, index: number) => {
            if (!section || typeof section !== "object") {
              return null;
            }

            const candidate = section as Partial<Section>;
            if (
              typeof candidate.id !== "string" ||
              typeof candidate.title !== "string"
            ) {
              return null;
            }

            return {
              id: candidate.id,
              title: candidate.title,
              order:
                typeof candidate.order === "number" &&
                Number.isFinite(candidate.order)
                  ? candidate.order
                  : index,
              parentId:
                typeof candidate.parentId === "string" &&
                candidate.parentId.length > 0
                  ? candidate.parentId
                  : null,
              content:
                typeof candidate.content === "string" &&
                candidate.content.length > 0
                  ? candidate.content
                  : EMPTY_SECTION_CONTENT,
            };
          })
          .filter(
            (section: Section | null): section is Section => section !== null
          );

        return {
          id: parsed.id,
          title: parsed.title,
          sections: normalizeSections(normalizedSections),
          tagValues: parsed.tagValues as Record<string, string>,
        };
      }
    }
  } catch (error) {
    console.error("Error loading document:", error);
  }
  return getSampleDocument();
};

export const saveDocument = (document: Document): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  } catch (error) {
    console.error("Error saving document:", error);
  }
};
