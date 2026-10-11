export type PermissionState = 'GRANTED' | 'DENIED' | 'ASK' | 'NOT_SUPPORTED';

export interface PermissionRecord {
  id: string;
  name: string;
  description: string;
  state: PermissionState;
  icon: string;
}

const STORAGE_KEY = 'neutron_permissions';

export class PermissionManager {
  private permissions: Map<string, PermissionState> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([k, v]) => {
          this.permissions.set(k, v as PermissionState);
        });
      } catch {}
    } else {
      // Sensible defaults
      this.permissions.set('MICROPHONE', 'ASK');
      this.permissions.set('FILES', 'GRANTED');
      this.permissions.set('CALENDAR', 'GRANTED');
      this.permissions.set('CONTACTS', 'GRANTED');
      this.permissions.set('MESSAGES', 'ASK');
      this.permissions.set('NOTIFICATIONS', 'GRANTED');
      this.permissions.set('DEVICE_CONTROL', 'ASK');
    }
  }

  public get(id: string): PermissionState {
    return this.permissions.get(id) || 'ASK';
  }

  public set(id: string, state: PermissionState): void {
    this.permissions.set(id, state);
    this.save();
  }

  private save() {
    const obj: Record<string, PermissionState> = {};
    for (const [k, v] of this.permissions.entries()) {
      obj[k] = v;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  public getAll(): PermissionRecord[] {
    return [
      {
        id: 'MICROPHONE',
        name: 'Microphone & Voice Input',
        description: 'Required for real-time voice conversations and audio reactivity.',
        state: this.get('MICROPHONE'),
        icon: 'Mic',
      },
      {
        id: 'FILES',
        name: 'Workspace Files & Documents',
        description: 'Allows searching, viewing, and organizing authorized project files.',
        state: this.get('FILES'),
        icon: 'Folder',
      },
      {
        id: 'CALENDAR',
        name: 'Calendar & Schedules',
        description: 'Allows reading agendas and scheduling upcoming events.',
        state: this.get('CALENDAR'),
        icon: 'Calendar',
      },
      {
        id: 'CONTACTS',
        name: 'Address Book & Contacts',
        description: 'Allows resolving contact names for messaging and communications.',
        state: this.get('CONTACTS'),
        icon: 'Users',
      },
      {
        id: 'MESSAGES',
        name: 'Messaging & Dispatch',
        description: 'Allows drafting and dispatching verified messages upon confirmation.',
        state: this.get('MESSAGES'),
        icon: 'MessageSquare',
      },
      {
        id: 'NOTIFICATIONS',
        name: 'System Notifications',
        description: 'Allows sending reminder alerts and task completion status.',
        state: this.get('NOTIFICATIONS'),
        icon: 'Bell',
      },
      {
        id: 'DEVICE_CONTROL',
        name: 'Device Telemetry & Settings',
        description: 'Allows querying battery, audio devices, and network status.',
        state: this.get('DEVICE_CONTROL'),
        icon: 'Cpu',
      },
    ];
  }
}

export const globalPermissionManager = new PermissionManager();
