export interface IUser {
  id: string;
  fullName: string,
  tpNumber: number,
  mobileNumber: number,
  email: string;
  userRole: string
  status: number;

  absolvedSteps?: any;

  currentStep?: { trainingName: string, step: number, absolvedSteps: string [] };

  currentDeviceId?: string;

  pushDeviceId?: string;

  trainings?: {trainingId: string, absolvedSteps: string[], completed: boolean}[];
}
