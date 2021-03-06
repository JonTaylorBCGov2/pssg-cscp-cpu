import { taskCode } from '../constants/task-code';
import { iTask } from './task.interface';
import { iMessage } from './message.interface';
import { iProgram } from './program.interface';
import { iPerson } from './person.interface';
import { iMinistryUser } from './ministry-user.interface';
import { iDynamicsBlob, iDynamicsCrmTask } from './dynamics-blob';
import { iContract } from './contract.interface';
import { iContactInformation } from './contact-information.interface';

import { contractCode } from '../constants/contract-code';
import { decodeTaskType } from '../constants/decode-task-type';
import { nameAssemble } from '../constants/name-assemble';

export class Transmogrifier {
  // collections of viewmodels

  public accountId: string; // this is the ID to identify an organization in dynamics. NOT A BCEID
  public contactInformation: iContactInformation;
  public organizationId: string;
  public organizationName: string;
  public userId: string;
  public persons: iPerson[];
  public contracts: iContract[];
  public ministryContact: iMinistryUser;

  constructor(b: iDynamicsBlob) {
    this.accountId = b.Organization.accountid || null; // the dynamics id must be included when posting back sometimes.
    this.contracts = [];
    this.organizationId = b.Businessbceid || null;
    this.organizationName = b.Organization.name || null;
    this.userId = b.Userbceid || null;
    this.contactInformation = this.buildContactInformation(b);
    this.persons = this.buildPersons(b);
    this.ministryContact = this.buildMinistryContact(b);
    this.contracts = this.buildContracts(b);
  }
  private buildTasks(b: iDynamicsBlob, contractId: string): iTask[] {
    const tasks: iTask[] = [];
    for (let task of b.Tasks) {
      // if the task matches the supplied contract return it
      if (task._regardingobjectid_value === contractId) {
        tasks.push({
          // convert the status from a meaningless dynamics number to a meaningful string
          status: taskCode(task.statuscode),
          // convert the numeric completion state from meaningless dynamics number to a useful boolean
          isCompleted: this.isCompleted(task.statecode),
          taskName: decodeTaskType(task._vsd_tasktypeid_value, true),
          taskTitle: task.subject,
          taskDescription: task.description,
          // make a date from the supplied date. TODO MomentJS
          deadline: task.scheduledend ? new Date(task.scheduledend) : null,
          taskId: this.getCorrectTaskIdByDiscriminator(contractId, task._vsd_programid_value, task, decodeTaskType(task._vsd_tasktypeid_value)),
          // what kind of form is this?
          formType: decodeTaskType(task._vsd_tasktypeid_value),
        });
      }
    }
    return tasks;
  }

  private buildMessages(b: iDynamicsBlob, contractId: string): iMessage[] {
    const messages: iMessage[] = [];
    for (let message of b.Messages) {
      if (message.regardingobjectid === contractId) {
        messages.push({
          timeStamp: null,
          from: null,
          to: null,
          direction: null,
          regardingObjectId: null,
          program: message.vsd_Program,
          cpuRegionDistrict: message.vsd_cpu_regiondistrict,
          subject: null,
          description: message.Description,
        })
      }
    }
    return messages;
  }

  private getCorrectTaskIdByDiscriminator(contractId: string, programId: string, t: iDynamicsCrmTask, discriminator: string): string {
    // lookups are dumb coming back from Dynamics we unify lookups so that we don't have Dynamics idiocy running wild in the forms.
    // sometimes we look up by a scheduleG ID, sometimes by a contractId, sometimes by a programId. :-(
    // the front end doesn't need to handle guids differently. They all act as a lookup key.
    // this is shorthand for an if statement in an if statement
    if (discriminator === 'budget_proposal') {
      return contractId;//works
    }
    if (discriminator === 'expense_report') {
      return t._vsd_schedulegid_value;//works
    }
    if (discriminator === 'status_report') {
      return programId;
    }
    if (discriminator === 'program_application') {
      return contractId;//works
    }
    if (discriminator === 'download_document') {
      return contractId;
    }
    if (discriminator === 'cover_letter') {
      // TODO: UNKNOWN AND UNTESTED
      return contractId;
    }
    return contractId;
  }
  private buildPrograms(b: iDynamicsBlob, contractId: string): iProgram[] {
    const programs: iProgram[] = [];
    for (let program of b.Programs) {
      if (program._vsd_contractid_value === contractId) {
        let programContact = b.Staff.find(s => s.contactid === program._vsd_contactlookup_value);
        programs.push({
          // build an address
          address: {
            city: program.vsd_city,
            line1: program.vsd_addressline1,
            line2: program.vsd_addressline2,
            postalCode: program.vsd_city,
            province: program.vsd_provincestate,
          },
          email: program.vsd_emailaddress,
          fax: program.vsd_fax,
          // build an address
          mailingAddress: {
            city: program.vsd_mailingcity,
            line1: program.vsd_mailingaddressline1,
            line2: program.vsd_mailingaddressline2,
            postalCode: program.vsd_mailingcity,
            province: program.vsd_mailingprovincestate,
          },
          phone: program.vsd_phonenumber,
          programId: program.vsd_programid,
          programName: program.vsd_name,
          contactName: programContact ? nameAssemble(programContact.firstname, programContact.middlename, programContact.lastname) : ""
        });
      }
    }
    return programs;
  }
  private isCompleted(code: number): boolean {
    if (code === 1) {
      return true; // this is completed
    } else {
      return false; // this is not completed
    }
  }
  private buildContracts(b: iDynamicsBlob): iContract[] {
    const contracts: iContract[] = [];
    if (b.Contracts.length > 0) {
      for (let contract of b.Contracts) {
        const status: [string, string] = contractCode(contract.statuscode);
        contracts.push({
          // upcoming, current, past
          category: status[0],
          // Sent, Received, Processing, Recommended for Approval, Escalated, Information Denied, Approved, Archived, No Status
          contractId: contract.vsd_contractid,
          contractNumber: contract.vsd_name,
          // isCompleted: this.isCompleted(contract.statecode), //TODO: Is this actually meaningful in the FE?
          programs: this.buildPrograms(b, contract.vsd_contractid),
          status: status[1],
          tasks: this.buildTasks(b, contract.vsd_contractid).filter(t => !t.isCompleted) || [],
          completedTasks: this.buildTasks(b, contract.vsd_contractid).filter(t => t.isCompleted) || [],
        });
      }
    }
    return contracts;
  }
  private buildMinistryContact(b: iDynamicsBlob): iMinistryUser {
    return {
      firstName: b.MinistryUser.firstname,
      lastName: b.MinistryUser.lastname,
      email: b.MinistryUser.internalemailaddress,
      phone: b.MinistryUser.address1_telephone1,
    };
  }
  private buildContactInformation(b: iDynamicsBlob): iContactInformation {
    // collect the organization meta and structure it into a new shape
    const ci: iContactInformation = {
      phoneNumber: b.Organization.telephone1 || null,
      emailAddress: b.Organization.emailaddress1 || null,
      faxNumber: b.Organization.fax || null,
      mainAddress: {
        city: b.Organization.address1_city || null,
        line1: b.Organization.address1_line1 || null,
        line2: b.Organization.address1_line2 || null,
        postalCode: b.Organization.address1_postalcode || null,
        province: b.Organization.address1_stateorprovince || null,
        country: 'Canada'
      }
    } as iContactInformation;

    // if there are any values in the returned data for the
    if (b.Organization && (b.Organization.address2_city || b.Organization.address2_line1 || b.Organization.address2_line2 || b.Organization.address2_postalcode || b.Organization.address2_stateorprovince)) {
      ci.mailingAddress = {
        city: b.Organization.address2_city || null,
        line1: b.Organization.address2_line1 || null,
        line2: b.Organization.address2_line2 || null,
        postalCode: b.Organization.address2_postalcode || null,
        province: b.Organization.address2_stateorprovince || null,
        country: 'Canada'
      };
      ci.hasMailingAddress = true;
    } else {
      ci.mailingAddress = {
        city: null,
        line1: null,
        line2: null,
        postalCode: null,
        province: null,
        country: 'Canada'
      };
      ci.hasMailingAddress = false;
    }
    if (b.Organization._vsd_executivecontactid_value)
      if (b.ExecutiveContact) ci.executiveContact = {
        email: b.ExecutiveContact.emailaddress1 || null,
        fax: b.ExecutiveContact.fax || null,
        firstName: b.ExecutiveContact.firstname || null,
        lastName: b.ExecutiveContact.lastname || null,
        middleName: b.ExecutiveContact.middlename || null,
        personId: b.ExecutiveContact.contactid || null,
        phone: b.ExecutiveContact.mobilephone || null,
        title: b.ExecutiveContact.jobtitle || null,
        address: {
          city: b.ExecutiveContact.address1_city || null,
          line1: b.ExecutiveContact.address1_line1 || null,
          line2: b.ExecutiveContact.address1_line2 || null,
          postalCode: b.ExecutiveContact.address1_postalcode || null,
          province: b.ExecutiveContact.address1_stateorprovince || null,
        } || null
      };

    // if there is a contact bound to this organization
    if (b.Organization._vsd_boardcontactid_value) {
      ci.boardContact = {
        email: b.BoardContact.emailaddress1 || null,
        fax: b.BoardContact.fax || null,
        firstName: b.BoardContact.firstname || null,
        lastName: b.BoardContact.lastname || null,
        middleName: b.BoardContact.middlename || null,
        personId: b.BoardContact.contactid || null,
        phone: b.BoardContact.mobilephone || null,
        title: b.BoardContact.jobtitle || null,
        address: {
          city: b.BoardContact.address1_city || null,
          line1: b.BoardContact.address1_line1 || null,
          line2: b.BoardContact.address1_line2 || null,
          postalCode: b.BoardContact.address1_postalcode || null,
          province: b.BoardContact.address1_stateorprovince || null,
        } || null
      };
      // save that this exists
      ci.hasBoardContact = true;
    } else {
      ci.hasBoardContact = false;
    }
    return ci;
  }
  private buildPersons(b: iDynamicsBlob): iPerson[] {
    const personList: iPerson[] = [];
    for (let p of b.Staff) {
      const person: iPerson = {
        address: {
          city: p.address1_city || null,
          line1: p.address1_line1 || null,
          line2: p.address1_line2 || null,
          postalCode: p.address1_postalcode || null,
          province: p.address1_stateorprovince || null,
        },
        email: p.emailaddress1 || null,
        fax: p.fax || null,
        firstName: p.firstname || null,
        lastName: p.lastname || null,
        middleName: p.middlename || null,
        personId: p.contactid || null,
        userId: p.vsd_bceid || null,
        phone: p.mobilephone || null,
        title: p.jobtitle || null,
        // if this person has the right value it is me.
        me: p.vsd_bceid ? true : false,
        // if the state code is zero or null the user is active
        deactivated: !p.statecode || p.statecode === 0 ? false : true || null,
      }
      personList.push(person);
    }
    return personList.sort((a: iPerson, b: iPerson) => {
      // same last name? sort by first name
      if (a.lastName === b.lastName) {
        // same first name? sort by middle name
        if (a.firstName === b.firstName) {
          // same middle name? just give up.
          if (a.middleName === b.middleName) {
            return 0
          }
          // sort by middle name
          if (a.middleName < b.middleName) {
            return -1;
          }
          if (a.middleName > a.middleName) {
            return 1;
          }
        }
        // sort by first name
        if (a.firstName < b.firstName) {
          return -1;
        }
        if (a.firstName > b.firstName) {
          return 1;
        }
      }
      // sort by last name
      if (a.lastName < b.lastName) {
        return -1;
      }
      if (a.lastName > b.lastName) {
        return 1;
      }
      // if there is an edge case return 0 so nothing breaks.
      return 0;
    });
  }
}
