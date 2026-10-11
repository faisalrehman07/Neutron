import { RiskLevel } from '../../types/tools';

export class PolicyEngine {
  public static evaluateRisk(toolName: string, args: Record<string, any>): RiskLevel {
    if (toolName === 'deleteFile' || toolName === 'deleteFolder' || toolName === 'clearMemory') {
      return 'DESTRUCTIVE';
    }

    if (
      toolName === 'sendMessage' ||
      toolName === 'makeCall' ||
      toolName === 'createCalendarEvent' ||
      toolName === 'sendNotification' ||
      toolName === 'modifyFile'
    ) {
      return 'SENSITIVE';
    }

    return 'SAFE';
  }

  public static requiresConfirmation(riskLevel: RiskLevel): boolean {
    return riskLevel === 'SENSITIVE' || riskLevel === 'DESTRUCTIVE';
  }
}
