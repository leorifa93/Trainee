export interface IStep {
  id?: any
  type: string;

  title: string;

  createdAt: number;

  active: boolean;

  videoUrl?: string;

  thumbnailUrl?: string;

  questions?: {question: string, isRightAnswer: boolean}[]

  order?: number;

  text?: string;

  pdfFileUrl?: string[];

  trainingId?: string;

}
