import { ToolDefinition } from '../../types/tools';

export const NEUTRON_TOOLS: ToolDefinition[] = [
  {
    name: 'searchWeb',
    description: 'Search the live web for up-to-date information, news, companies, or tech documentation.',
    riskLevel: 'SAFE',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'The search query to look up on the web.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'searchFiles',
    description: 'Search through user files, documents, presentations, and project directories.',
    riskLevel: 'SAFE',
    requiredPermission: 'FILES',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Filename, keywords, or topic to search for (e.g., "presentation", "Project Atlas").',
        },
        fileType: {
          type: 'STRING',
          description: 'Optional file extension or category (e.g. "presentation", "document", "code").',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'createFileOrFolder',
    description: 'Create a new file or directory in the user workspace.',
    riskLevel: 'SAFE',
    requiredPermission: 'FILES',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'The name of the file or folder (e.g., "Projects", "notes.md").',
        },
        type: {
          type: 'STRING',
          description: '"file" or "folder"',
        },
        content: {
          type: 'STRING',
          description: 'Initial text content if type is file.',
        },
      },
      required: ['name', 'type'],
    },
  },
  {
    name: 'deleteFile',
    description: 'Permanently remove a file or folder from the workspace. High-risk destructive operation.',
    riskLevel: 'DESTRUCTIVE',
    requiredPermission: 'FILES',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'The name or path of the file/folder to permanently remove.',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'getCalendarSchedule',
    description: 'Get upcoming meetings, schedule, agenda, and plans for today or a specific date.',
    riskLevel: 'SAFE',
    requiredPermission: 'CALENDAR',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: {
          type: 'STRING',
          description: 'Date string or "today", "tomorrow". Defaults to today.',
        },
      },
    },
  },
  {
    name: 'createReminder',
    description: 'Set a timed reminder or task deadline for the user.',
    riskLevel: 'SENSITIVE',
    requiredPermission: 'NOTIFICATIONS',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: {
          type: 'STRING',
          description: 'The reminder message or task to perform.',
        },
        time: {
          type: 'STRING',
          description: 'When to remind the user (e.g., "tomorrow at 10 AM", "in 2 hours").',
        },
      },
      required: ['text', 'time'],
    },
  },
  {
    name: 'sendMessage',
    description: 'Draft and send a direct message or SMS to a contact.',
    riskLevel: 'SENSITIVE',
    requiredPermission: 'MESSAGES',
    parameters: {
      type: 'OBJECT',
      properties: {
        recipient: {
          type: 'STRING',
          description: 'Name or email/phone of the recipient (e.g. "John", "Mom").',
        },
        message: {
          type: 'STRING',
          description: 'The exact message content to send.',
        },
        channel: {
          type: 'STRING',
          description: 'Channel to send on: "chat", "sms", or "email".',
        },
      },
      required: ['recipient', 'message'],
    },
  },
  {
    name: 'getContacts',
    description: 'Search or retrieve the user authorized contacts list.',
    riskLevel: 'SAFE',
    requiredPermission: 'CONTACTS',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Name to look for (e.g., "John", "Mom").',
        },
      },
    },
  },
  {
    name: 'getSystemInfo',
    description: 'Get device hardware telemetry, battery, connection state, memory, and OS capabilities.',
    riskLevel: 'SAFE',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'calculate',
    description: 'Perform precise mathematical calculations, unit conversions, or scientific formulas.',
    riskLevel: 'SAFE',
    parameters: {
      type: 'OBJECT',
      properties: {
        expression: {
          type: 'STRING',
          description: 'Mathematical expression to compute (e.g., "24 * 365", "sqrt(144)").',
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'saveMemory',
    description: 'Explicitly store an important preference, project detail, or fact into long-term memory.',
    riskLevel: 'SAFE',
    parameters: {
      type: 'OBJECT',
      properties: {
        category: {
          type: 'STRING',
          description: '"PREFERENCES", "PROJECT_CONTEXT", or "LONG_TERM"',
        },
        key: {
          type: 'STRING',
          description: 'Short title or concept key.',
        },
        value: {
          type: 'STRING',
          description: 'The detail to remember.',
        },
      },
      required: ['category', 'key', 'value'],
    },
  },
];
