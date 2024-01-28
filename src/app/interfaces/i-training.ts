import {IStep} from "./i-step";

export interface ITraining {
  id?: string;
  title: string;
  description: string;
  stepsLength: string;

  steps?: IStep[];
}
