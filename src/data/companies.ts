export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  description: string;
}

export const companies: Company[] = [
  {
    id: "1",
    name: "Anthropic",
    domain: "anthropic.com",
    industry: "AI/ML",
    description: "AI safety company building reliable, interpretable, and steerable AI systems."
  },
  {
    id: "2",
    name: "Stripe",
    domain: "stripe.com",
    industry: "Fintech",
    description: "Financial infrastructure platform for the internet."
  },
  {
    id: "3",
    name: "Figma",
    domain: "figma.com",
    industry: "SaaS",
    description: "Collaborative interface design tool."
  },
  {
    id: "4",
    name: "Notion",
    domain: "notion.so",
    industry: "SaaS",
    description: "All-in-one workspace for notes, docs, and project management."
  },
  {
    id: "5",
    name: "Linear",
    domain: "linear.app",
    industry: "SaaS",
    description: "Issue tracking for modern software teams."
  },
  {
    id: "6",
    name: "Roofstock",
    domain: "roofstock.com",
    industry: "Fintech",
    description: "Investment platform for rental properties."
  },
  {
    id: "7",
    name: "Hugging Face",
    domain: "huggingface.co",
    industry: "AI/ML",
    description: "The AI community building the future."
  },
  {
    id: "8",
    name: "Verily",
    domain: "verily.com",
    industry: "Healthcare",
    description: "Integrated digital health solutions."
  },
  {
    id: "9",
    name: "Mystery",
    domain: "mystery.com",
    industry: "E-commerce",
    description: "Premium mystery shopping platform."
  },
  {
    id: "10",
    name: "Climeworks",
    domain: "climeworks.com",
    industry: "Cleantech",
    description: "Direct air capture technology to remove CO2."
  },
  {
    id: "11",
    name: "Databricks",
    domain: "databricks.com",
    industry: "AI/ML",
    description: "Unified analytics platform for data science."
  },
  {
    id: "12",
    name: "Plaid",
    domain: "plaid.com",
    industry: "Fintech",
    description: "Financial data connectivity platform."
  },
  {
    id: "13",
    name: "Shopify",
    domain: "shopify.com",
    industry: "E-commerce",
    description: "Commerce platform for anyone selling products."
  },
  {
    id: "14",
    name: "Anduril",
    domain: "anduril.com",
    industry: "Cleantech",
    description: "Defense technology company building autonomous systems."
  },
  {
    id: "15",
    name: "Tempus",
    domain: "tempus.com",
    industry: "Healthcare",
    description: "Precision medicine company combining clinical data with AI."
  }
];

export const industries = [
  "All",
  "AI/ML",
  "Fintech",
  "SaaS",
  "Healthcare",
  "E-commerce",
  "Cleantech"
];
