import { iAddress } from "./address.interface";

export interface iContactInformation {
  // this interface is very much incomplete.
  organizationName: string;
  contractNumber: string;

  emailAddress?: string;
  address?: iAddress;
}
