import { TranscriptSegment } from '../../types/research';

type TranscriptListener = (segments: TranscriptSegment[], activePartial: string) => void;

export class TranscriptProcessor {
  private segments: TranscriptSegment[] = [];
  private activePartial = '';
  private rawBuffer = '';
  private listeners: Set<TranscriptListener> = new Set();
  private currentTurnId = 0;

  constructor() {}

  public appendChunk(chunk: string): void {
    if (!chunk) return;

    this.rawBuffer += chunk;
    this.processBuffer();
  }

  private processBuffer(): void {
    let text = this.rawBuffer;

    // Sentence boundary regex: punctuation followed by space or newline, or double newline
    const sentenceEndRegex = /([.?!])\s+|\n+/;

    while (text.length > 0) {
      const match = text.match(sentenceEndRegex);
      if (!match || match.index === undefined) {
        break;
      }

      const matchEnd = match.index + match[0].length;
      const sentenceText = text.slice(0, match.index + (match[1] ? 1 : 0)).trim();
      text = text.slice(matchEnd);

      if (sentenceText.length > 0) {
        this.addCompletedSegment(sentenceText);
      }
    }

    this.rawBuffer = text;
    this.activePartial = this.normalizeSpacing(this.rawBuffer);
    this.notify();
  }

  private addCompletedSegment(rawText: string): void {
    const cleanText = this.normalizeSpacing(rawText);
    if (!cleanText) return;

    // Avoid duplicate segments
    const lastSeg = this.segments[this.segments.length - 1];
    if (lastSeg && lastSeg.text === cleanText) {
      return;
    }

    const type = this.detectSegmentType(cleanText);

    const segment: TranscriptSegment = {
      id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: cleanText,
      type,
      timestamp: Date.now(),
      isComplete: true,
    };

    this.segments.push(segment);
  }

  private detectSegmentType(text: string): TranscriptSegment['type'] {
    // Numbered list item: e.g. "1. First item", "2) Second item", "• Item"
    if (/^(\d+[\.\)]\s+|[-*•]\s+)/i.test(text.trim())) {
      return 'list';
    }
    // Heading or prompt intro: e.g. "Here are three key findings:", "Summary:"
    if (/:$/.test(text.trim()) && text.length < 80) {
      return 'heading';
    }
    return 'sentence';
  }

  private normalizeSpacing(str: string): string {
    return str
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.?!:;])/g, '$1')
      .trim();
  }

  public finalizeTurn(): void {
    if (this.rawBuffer.trim().length > 0) {
      this.addCompletedSegment(this.rawBuffer);
    }
    this.rawBuffer = '';
    this.activePartial = '';
    this.currentTurnId++;
    this.notify();
  }

  public interrupt(): void {
    // On user barge-in, drop pending partial buffer so stale text doesn't leak
    this.rawBuffer = '';
    this.activePartial = '';
    this.notify();
  }

  public clear(): void {
    this.segments = [];
    this.activePartial = '';
    this.rawBuffer = '';
    this.notify();
  }

  public getSegments(): TranscriptSegment[] {
    return [...this.segments];
  }

  public getActivePartial(): string {
    return this.activePartial;
  }

  public getFullText(): string {
    const completed = this.segments.map((s) => s.text).join(' ');
    return this.activePartial ? `${completed} ${this.activePartial}`.trim() : completed;
  }

  public subscribe(listener: TranscriptListener): () => void {
    this.listeners.add(listener);
    listener([...this.segments], this.activePartial);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const segs = [...this.segments];
    const partial = this.activePartial;
    for (const listener of this.listeners) {
      listener(segs, partial);
    }
  }
}

export const globalTranscriptProcessor = new TranscriptProcessor();
