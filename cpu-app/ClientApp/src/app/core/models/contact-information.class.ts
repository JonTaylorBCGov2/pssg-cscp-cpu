import { Person } from "./person.class";
import { Address } from "./address.class";
import { iContactInformation } from "./contact-information.interface";
import { iAddress } from "./address.interface";
import { iPerson } from "./person.interface";

export class ContactInformation implements iContactInformation {
  emailAddress: string;
  phoneNumber: string;
  faxNumber: string;
  mainAddress: iAddress;
  mailingAddress: iAddress;

  executiveContact: iPerson;
  boardContact: iPerson;

  constructor(info?: iContactInformation) {
    if (info) {
      this.emailAddress = info.emailAddress || null;
      this.phoneNumber = info.phoneNumber || null;
      this.faxNumber = info.faxNumber || null;
      this.mainAddress = new Address(info.mainAddress) || new Address();
      this.mailingAddress = new Address(info.mailingAddress) || new Address();
      this.executiveContact = new Person(info.executiveContact) || new Person();
      this.boardContact = new Person(info.boardContact) || new Person();
    } else {
      this.mainAddress = new Address();
      this.mailingAddress = new Address();
      this.executiveContact = new Person();
      this.boardContact = new Person();
    }
  }
}
