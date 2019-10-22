import { iOrganizationMeta } from './organization-meta.class';
import { iAddress } from './address.class';
import { iContactInformation } from './contact-information.class';
import { iPerson } from './person.class';
import { iTombstone } from './tombstone.class';
import { iMinistryUser } from './ministry-user';
import { iContract } from './contract';
import { iTask } from './task';

export class Transmogrifier {
  public organizationMeta: iOrganizationMeta;
  public persons: iPerson[];
  public tombstones: iTombstone[];
  public contracts: iContract[];
  public ministryContact: iMinistryUser;
  public tasks: iTask[];

  constructor(b: iDynamicsBlob) {
    this.organizationMeta = this.buildOrganizationMeta(b);
    this.persons = this.buildPersons(b);
    this.ministryContact = this.buildMinistryContact(b);
    this.contracts = this.buildContracts(b);
    this.tasks = this.buildTasks(b);
  }
  private buildTasks(b: iDynamicsBlob): iTask[] {
    function taskCode(statuscode: number): string {
      let textStatus;
      switch (statuscode) {
        case 2: {
          textStatus = 'Not Started';
          break;
        }
        case 3: {
          textStatus = 'In Progress';
          break;
        }
        case 4: {
          textStatus = 'Waiting';
          break;
        }
        case 7: {
          textStatus = 'Deferred';
          break;
        }
        case 5: {
          textStatus = 'Completed';
          break;
        }
        case 6: {
          textStatus = 'Cancelled';
          break;
        }
        default: {
          textStatus = 'No Status';
          break;
        }
      }
      return textStatus;
    }
    const tasks: iTask[] = [];
    for (let task of b.Tasks) {
      tasks.push({
        status: taskCode(task.statuscode),
        isCompleted: this.isCompleted(task.statecode),
        taskName: task.subject,
        taskDescription: task.description,
        deadline: new Date(task.scheduledend),
        taskId: task.activityid,
        contractId: task._regardingobjectid_value,
      });
    }
    return tasks;
  }
  private isCompleted(code: number): boolean {
    if (code === 1) {
      return true; // this is completed
    } else {
      return false; // this is not completed
    }
  }
  private buildContracts(b: iDynamicsBlob): iContract[] {
    function contractCode(statuscode: number): string {
      let textStatus;
      switch (statuscode) {
        // upcoming
        case 100000000: {
          textStatus = 'Sent';
          break;
        }
        case 100000001: {
          textStatus = 'Received';
          break;
        }
        case 100000002: {
          textStatus = 'Processing';
          break;
        }
        case 100000003: {
          textStatus = 'Recommended for Approval';
          break;
        }
        case 100000004: {
          textStatus = 'Escalated';
          break;
        }
        case 100000005: {
          textStatus = 'Information Denied';
          break;
        }
        // approved
        case 100000006: {
          textStatus = 'Approved';
          break;
        }
        // past
        case 2: {
          textStatus = 'Archived';
          break;
        }
        default: {
          textStatus = 'No Status';
          break;
        }
      }
      return textStatus;
    }
    const contracts: iContract[] = [];
    if (b.Contracts.length > 0) {
      for (let contract of b.Contracts) {
        contracts.push({
          isCompleted: this.isCompleted(contract.statecode),
          contractNumber: contract.vsd_name,
          contractId: contract.vsd_contractid,
          status: contractCode(contract.statuscode),
        });
      }
    }
    return contracts;
  }
  private buildMinistryContact(b: iDynamicsBlob): iMinistryUser {
    return {} as iMinistryUser;
  }
  private buildOrganizationMeta(b: iDynamicsBlob): iOrganizationMeta {
    // collect the organization meta and structure it into a new shape
    return {
      organizationId: b.bceid || null,
      organizationName: b.Organization.name || null,
      contactInformation: {
        phoneNumber: b.Organization.telephone1 || null,
        emailAddress: b.Organization.emailaddress1 || null,
        faxNumber: b.Organization.fax || null,
        mainAddress: {
          city: b.Organization.address1_city || null,
          line1: b.Organization.address1_line1 || null,
          line2: b.Organization.address1_line2 || null,
          postalCode: b.Organization.address1_postalcode || null,
          province: b.Organization.address1_stateorprovince || null,
        } as iAddress,
        mailingAddress: {
          city: b.Organization.address2_city || null,
          line1: b.Organization.address2_line1 || null,
          line2: b.Organization.address2_line2 || null,
          postalCode: b.Organization.address2_postalcode || null,
          province: b.Organization.address2_stateorprovince || null,
        } as iAddress,
        executiveContact: {
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
          } as iAddress
        },
        boardContact: {
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
          } as iAddress
        },
      } as iContactInformation
    } as iOrganizationMeta;
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
        phone: p.mobilephone || null,
        title: p.jobtitle || null,
      }
      personList.push(person);
    }
    return personList;
  }
  private buildTombStones(b: iDynamicsBlob): iTombstone[] {
    // TODO: collect tombstones
    const tombstones: iTombstone[] = [];

    return tombstones;
  }
}

interface iDynamicsOrganization {
  "@odata.etag": string;
  _ownerid_value?: string;
  _vsd_boardcontactid_value?: string;
  _vsd_executivecontactid_value?: string;
  accountid?: string;
  address1_city?: string;
  address1_composite?: string;
  address1_line1?: string;
  address1_line2?: string;
  address1_postalcode?: string;
  address1_stateorprovince?: string;
  address2_city?: string;
  address2_composite?: string;
  address2_line1?: string;
  address2_line2?: string;
  address2_postalcode?: string;
  address2_stateorprovince?: string;
  emailaddress1?: string;
  fax?: string;
  name?: string;
  telephone1?: string;
}
interface iDynamicsCrmContact {
  "@odata.type"?: string;
  "@odata.etag"?: string;
  _parentcustomerid_value?: string;
  address1_city?: string;
  address1_composite?: string;
  address1_line1?: string;
  address1_line2?: string;
  address1_postalcode?: string;
  address1_stateorprovince?: string;
  contactid?: string;
  emailaddress1?: string;
  fax?: string;
  firstname?: string;
  fullname?: string;
  jobtitle?: string;
  lastname?: string;
  middlename?: string;
  mobilephone?: string;
  vsd_bceid?: string;
}
interface iDynamicsCrmContract {
  "@odata.type": string;
  "@odata.etag": string;
  _vsd_contactlookup1_value?: string;
  _vsd_contactlookup2_value?: string;
  _vsd_customer_value?: string;
  statuscode?: number;
  statecode?: number;
  vsd_contractid?: string;
  vsd_name?: string;
}
interface iDynamicsMinistryUser {
  "@odata.etag": string;
  fullname?: string;
  ownerid?: string;
  systemuserid?: string;
}
interface iDynamicsCrmProgram {
  "@odata.type": string;
  "@odata.etag": string;
  _vsd_contactlookup_value?: string;
  _vsd_contractid_value?: string;
  _vsd_cpu_regiondistrict_value?: string;
  _vsd_cpu_regiondistrictlookup2_value?: string;
  _vsd_serviceproviderid_value?: string;
  vsd_addressline1?: string;
  vsd_addressline2?: string;
  vsd_city?: string;
  vsd_emailaddress?: string;
  vsd_fax?: string;
  vsd_mailingaddressline1?: string;
  vsd_mailingaddressline2?: string;
  vsd_mailingcity?: string;
  vsd_mailingpostalcodezip?: string;
  vsd_mailingprovincestate?: string;
  vsd_name?: string;
  vsd_phonenumber?: string;
  vsd_postalcodezip?: string;
  vsd_programid?: string;
  vsd_provincestate?: string;
}
interface iDynamicsCrmTask {
  "@odata.type": string;
  "@odata.etag": string;
  _regardingobjectid_value?: string;
  activityid?: string;
  description?: string;
  scheduledend?: string;
  statecode?: number;
  statuscode?: number;
  subject?: string;
}
export interface iDynamicsBlob {
  "@odata.context": string;
  BoardContact?: iDynamicsCrmContact,
  Contracts?: iDynamicsCrmContract[];
  ExecutiveContact?: iDynamicsCrmContact,
  IsSuccess?: true;
  MinistryUser?: iDynamicsMinistryUser;
  Organization?: iDynamicsOrganization;
  Programs?: iDynamicsCrmProgram[];
  Result?: string;
  Staff?: iDynamicsCrmContact[];
  Tasks?: iDynamicsCrmTask[]
  bceid: string;

};
