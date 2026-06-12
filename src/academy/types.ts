export type BlockType =
  | 'title'
  | 'paragraph'
  | 'heading'
  | 'alert'
  | 'steps'
  | 'image'
  | 'list'
  | 'card'
  | 'troubleshooting'
  | 'role-cards'
  | 'stage-list'
  | 'divider';

export interface AcademyBlock {
  id: string;
  type: BlockType;
  content: Record<string, any>;
}

export interface ArticleData {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  blocks: AcademyBlock[];
}

export const ARTICLE_ICONS: Record<string, string> = {
  'op-contatos': 'Upload',
  'op-contas-monitor': 'Monitor',
  'op-templates': 'MessageSquare',
  'op-campanhas': 'Calendar',
  'op-execucao': 'Play',
  'op-troubleshooting': 'AlertTriangle',
  'fin-visao': 'BarChart',
  'fin-vendas': 'Target',
  'fin-pagamentos': 'DollarSign',
  'fin-comissoes': 'UserPlus',
  'fin-reembolsos': 'RotateCcw',
  'cli-dashboard': 'Layout',
  'cli-relatorios': 'BarChart3',
  'cli-briefings': 'FileText',
  'cli-links': 'Link',
  'cli-smartbio': 'Smartphone',
  'adm-crm': 'Target',
  'adm-fluxo': 'Activity',
  'adm-consultiva': 'Users',
  'adm-acessos': 'ShieldCheck',
  'adm-monitor': 'RefreshCw',
};

export const BLOCK_ICONS: Record<string, string> = {
  title: 'Heading',
  paragraph: 'FileText',
  heading: 'Heading1',
  alert: 'AlertCircle',
  steps: 'ListOrdered',
  image: 'Image',
  list: 'List',
  card: 'LayoutGrid',
  troubleshooting: 'Bug',
  'role-cards': 'Shield',
  'stage-list': 'GitBranch',
  divider: 'SeparatorHorizontal',
};
