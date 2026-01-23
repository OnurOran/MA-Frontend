import { QuestionType } from '@/src/types';
import { QuestionTypeConfig } from './types';

class QuestionTypeRegistry {
  private registry = new Map<QuestionType, QuestionTypeConfig>();

  register(config: QuestionTypeConfig): void {
    this.registry.set(config.type, config);
  }

  get(type: QuestionType): QuestionTypeConfig | undefined {
    return this.registry.get(type);
  }

  getAll(): QuestionTypeConfig[] {
    return Array.from(this.registry.values());
  }

  has(type: QuestionType): boolean {
    return this.registry.has(type);
  }
}

export const questionTypeRegistry = new QuestionTypeRegistry();

export function getQuestionType(type: QuestionType): QuestionTypeConfig | undefined {
  return questionTypeRegistry.get(type);
}

export function getAllQuestionTypes(): QuestionTypeConfig[] {
  return questionTypeRegistry.getAll();
}

export function registerQuestionType(config: QuestionTypeConfig): void {
  questionTypeRegistry.register(config);
}
