import { iTask } from "./task";
import { iProgram } from "./program";

export interface iContract {
  // isCompleted: boolean; // basically useless
  category: string;
  contractId: string;
  contractNumber: string;
  status: string;
  programs?: iProgram[];
  tasks?: iTask[];
}
