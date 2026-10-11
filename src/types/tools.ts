export type RiskLevel = 'SAFE' | 'SENSITIVE' | 'DESTRUCTIVE';

export interface ToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  requiredPermission?: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolExecutionResult {
  tool: string;
  success: boolean;
  data: any;
  message?: string;
  executionMode: 'REAL' | 'SIMULATED' | 'UNAVAILABLE';
  riskLevel: RiskLevel;
}
