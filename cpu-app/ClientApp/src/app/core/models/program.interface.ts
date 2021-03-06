import { iAddress } from "./address.interface";

export interface iProgram {
  address: iAddress;
  email: string;
  fax: string;
  mailingAddress: iAddress;
  phone: string;
  programId: string;
  programName: string;
  contactName?: string;
}
