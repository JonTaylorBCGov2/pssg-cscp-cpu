import { decodeCcseaMemberType } from '../constants/decode-ccsea-member-type';
import { decodeCglInsurance } from '../constants/decode-cgl-insurance-type';
import { decodeToWeekDays } from '../constants/decode-to-week-days';
import { iAdministrativeInformation } from "./administrative-information.interface";
import { iContactInformation } from "./contact-information.interface";
import { iDynamicsScheduleFResponse, iDynamicsCrmContact, iDynamicsCrmContract } from "./dynamics-blob";
import { iHours } from "./hours.interface";
import { iPerson } from "./person.interface";
import { iProgramApplication } from "./program-application.interface";
import { iSignature } from '../../authenticated/subforms/program-authorizer/program-authorizer.component';
import { makeViewTimeString } from './converters/hours-to-dynamics';
import { ngDevModeResetPerfCounters } from '@angular/core/src/render3/ng_dev_mode';
import { boolOptionSet } from '../constants/bool-optionset-values';

export class TransmogrifierProgramApplication {
  accountId: string;// this is the dynamics account
  administrativeInformation: iAdministrativeInformation;
  cglInsurance: string; // commercial general liability insurance detail string picked from options.
  contactInformation: iContactInformation;
  contractId: string;
  contractName: string;
  contractNumber: string;
  organizationId: string;
  organizationName: string;
  programApplications: iProgramApplication[];
  signature: iSignature;
  userId: string;

  constructor(g: iDynamicsScheduleFResponse) {
    this.accountId = g.Organization.accountid;
    this.contractId = g.Contract.vsd_contractid;
    this.contractName = g.Contract.vsd_name;
    this.contractNumber = g.Contract.vsd_name;
    this.organizationId = g.Businessbceid;
    this.organizationName = g.Organization.name;
    this.userId = g.Userbceid;
    this.administrativeInformation = this.buildAdministrativeInformation(g);
    this.cglInsurance = decodeCglInsurance(g.Contract.vsd_cpu_insuranceoptions);
    this.contactInformation = this.buildContactInformation(g);
    this.programApplications = this.buildProgramApplications(g);
    this.signature = this.buildSignature(g);
  }
  private buildSignature(b: iDynamicsScheduleFResponse): iSignature {
    return {
      signer: undefined,
      signature: "", // TODO: not sure how the signature collection part works yet
      signatureDate: undefined,
      termsConfirmation: false
    };
  }
  private buildAdministrativeInformation(b: iDynamicsScheduleFResponse): iAdministrativeInformation {
    return {
      ccseaMemberType: decodeCcseaMemberType(parseInt(b.Contract.vsd_cpu_memberofcssea)),
      compliantEmploymentStandardsAct:
        b.Contract.vsd_cpu_humanresourcepolices ? b.Contract.vsd_cpu_humanresourcepolices.includes("100000000") : false,
      compliantHumanRights:
        b.Contract.vsd_cpu_humanresourcepolices ? b.Contract.vsd_cpu_humanresourcepolices.includes("100000001") : false,
      compliantWorkersCompensation:
        b.Contract.vsd_cpu_humanresourcepolices ? b.Contract.vsd_cpu_humanresourcepolices.includes("100000002") : false,
      staffSubcontractedPersons: b.StaffCollection.map((s: iDynamicsCrmContact): iPerson => {
        return {
          email: s.emailaddress1 || null,
          fax: s.fax || null,
          firstName: s.firstname || null,
          lastName: s.lastname || null,
          middleName: s.middlename || null,
          personId: s.contactid || null,
          phone: s.mobilephone || null,
          title: s.jobtitle || null,
          userId: s.vsd_bceid || null,
          address: {
            city: s.address1_city || null,
            country: s.address1_country || 'Canada',
            line1: s.address1_line1 || null,
            line2: s.address1_line2 || null,
            postalCode: s.address1_postalcode || null,
            province: s.address1_stateorprovince || null,
          },
        };
      }) || [],
      staffUnion: b.Contract.vsd_cpu_specificunion,
      staffSubcontracted: b.Contract.vsd_cpu_subcontractedprogramstaff ? b.Contract.vsd_cpu_subcontractedprogramstaff === boolOptionSet.isTrue ? true : false : null,
      staffUnionized: b.Contract.vsd_cpu_unionizedstaff ? b.Contract.vsd_cpu_unionizedstaff === boolOptionSet.isTrue ? true : false : null,
    }
  }
  private buildContactInformation(b: iDynamicsScheduleFResponse): iContactInformation {
    const c: iContactInformation = {
      emailAddress: b.Organization.emailaddress1 || null,
      faxNumber: b.Organization.fax || null,
      phoneNumber: b.Organization.telephone1 || null,
      mainAddress: {
        city: b.Organization.address1_city || null,
        country: b.Organization.address1_country || 'Canada',
        line1: b.Organization.address1_line1 || null,
        line2: b.Organization.address1_line2 || null,
        postalCode: b.Organization.address1_postalcode || null,
        province: b.Organization.address1_stateorprovince || null
      },
      mailingAddress: {
        city: b.Organization.address2_city || null,
        country: b.Organization.address2_country || 'Canada',
        line1: b.Organization.address2_line1 || null,
        line2: b.Organization.address2_line2 || null,
        postalCode: b.Organization.address2_postalcode || null,
        province: b.Organization.address2_stateorprovince || null
      },
      // if any of the properties besides the country is not null then they have a mailing address (API limitation)
      hasMailingAddress: !!(b.Organization.address2_city || b.Organization.address2_line1 || b.Organization.address2_line2 || b.Organization.address2_stateorprovince || b.Organization.address2_postalcode)

    }
    // when the board contact and the executive contact are the same person then we simply don't fill in executive contact information and set the flag to false
    if (b.BoardContact && (b.Contract._vsd_contactlookup1_value !== b.Contract._vsd_contactlookup2_value)) {
      c.boardContact = {
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
          country: b.BoardContact.address1_country || 'Canada',
          line1: b.BoardContact.address1_line1 || null,
          line2: b.BoardContact.address1_line2 || null,
          postalCode: b.BoardContact.address1_postalcode || null,
          province: b.BoardContact.address1_stateorprovince || null
        }
      };
    }
    // the board contact's existence determines whether or not this flag is true or false.
    c.hasBoardContact = !!c.boardContact;

    if (b.ExecutiveContact) c.executiveContact = {
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
        country: b.ExecutiveContact.address1_country || 'Canada',
        line1: b.ExecutiveContact.address1_line1 || null,
        line2: b.ExecutiveContact.address1_line2 || null,
        postalCode: b.ExecutiveContact.address1_postalcode || null,
        province: b.ExecutiveContact.address1_stateorprovince || null,
      }
    }
    return c;
  }
  private buildProgramApplications(g: iDynamicsScheduleFResponse): iProgramApplication[] {
    const applications: iProgramApplication[] = [];
    for (let p of g.ProgramCollection) {
      let temp: iProgramApplication = {
        contractId: p._vsd_contractid_value,
        emailAddress: p.vsd_emailaddress || g.Organization.emailaddress1 || null, // fallback to organization email address
        faxNumber: p.vsd_fax,
        formState: 'untouched',// untouched	incomplete invalid complete info,
        name: p.vsd_name,
        phoneNumber: p.vsd_phonenumber,
        programId: p.vsd_programid,
        serviceArea: g.RegionDistrictCollection.filter(x => p._vsd_cpu_regiondistrictlookup2_value === x.vsd_regiondistrictid).map(a => a.vsd_name)[0] || 'Unknown', //p._vsd_cpu_regiondistrictlookup2_value,
        mainAddress: {
          line1: p.vsd_addressline1 || null,
          line2: p.vsd_addressline2 || null,
          city: p.vsd_city || null,
          postalCode: p.vsd_postalcodezip || null,
          province: p.vsd_provincestate || null,
          country: p.vsd_country || 'Canada',
        },
        mailingAddress: {
          city: p.vsd_mailingcity || null,
          line1: p.vsd_mailingaddressline1 || null,
          line2: p.vsd_mailingaddressline2 || null,
          postalCode: p.vsd_mailingpostalcodezip || null,
          province: p.vsd_mailingprovincestate || null,
          country: p.vsd_mailingcountry || 'Canada',
        },
        programContact: g.StaffCollection
          .filter((c: iDynamicsCrmContact): boolean => p._vsd_contactlookup_value === c.contactid)
          .map(s => this.makePerson(g, s.contactid))[0] || null,
        // revenueSources: [],//iRevenueSource[];
        additionalStaff: g.ProgramContactCollection
          .filter((c: iDynamicsCrmContact) => c.vsd_programid === p.vsd_programid)
          .map(s => this.makePerson(g, s.contactid)) || null,// iPerson[];
        operationHours: [],//iHours[];
        standbyHours: [],//iHours[];
        removedStaff: []
      } as iProgramApplication;

      temp.programLocation = g.RegionDistrictCollection.filter(x => p._vsd_cpu_regiondistrict_value === x.vsd_regiondistrictid).map(a => a.vsd_name)[0] || 'Unknown';

      // const programLocations = g.RegionDistrictCollection.filter(x => p._vsd_cpu_regiondistrict_value === x.vsd_regiondistrictid);
      // if (programLocations.length) {
      //   //if there is a match we add it otherwise skip it. Done like this because Dynamics has the tendency to mess up the regiondistrict collection and that causes errors.
      //   temp.programLocation = programLocations[0].vsd_name;
      // } else {
      //   temp.programLocation = 'Unknown';
      // }

      // add operation and standby hours
      for (let sched of g.ScheduleCollection) {
        // if the schedule matches this program collect it.
        if (sched._vsd_programid_value === p.vsd_programid) {
          // split the times into something that we can turn into moment
          const hours: iHours = {
            //save the hours into moment format.
            open: makeViewTimeString(sched.vsd_scheduledstarttime),
            closed: makeViewTimeString(sched.vsd_scheduledendtime),
            // save the identifier for the post back to dynamics
            hoursId: sched.vsd_scheduleid,
            // convert the nasty comma seperated string version to useful week day boolean
            ...decodeToWeekDays(sched.vsd_days)
          };
          // check for which collection of hours this is
          if (sched.vsd_cpu_scheduletype === 100000000) {
            // The type is active hours
            temp.operationHours.push(hours);
          } else if (sched.vsd_cpu_scheduletype === 100000001) {
            // the type is standby hours
            temp.standbyHours.push(hours);
          }
        }
      }
      // add to the collection of program applications
      applications.push(temp)
    }
    return applications;
  }
  private makePerson(g: iDynamicsScheduleFResponse, personId: string): iPerson {
    // return whole person
    return g.StaffCollection
      .filter((p: iDynamicsCrmContact) => p.contactid === personId)
      .map((p: iDynamicsCrmContact): iPerson => {
        return {
          email: p.emailaddress1 || null,
          fax: p.fax || null,
          firstName: p.firstname || null,
          lastName: p.lastname || null,
          middleName: p.middlename || null,
          personId: p.contactid || null,
          phone: p.mobilephone || null,
          title: p.jobtitle || null,
          userId: p.vsd_bceid || null,
          address: {
            line1: p.address1_line1 || null,
            line2: p.address1_line2 || null,
            city: p.address1_city || null,
            postalCode: p.address1_postalcode || null,
            province: p.address1_stateorprovince || null,
            country: p.address1_country || 'Canada',
          },
        }
      })[0];
  }

  private makePersonFromProgramContactCollection(g: iDynamicsScheduleFResponse, personId: string): iPerson {
    // return whole person
    return g.ProgramContactCollection
      .filter((p: iDynamicsCrmContact) => p.contactid === personId)
      .map((p: iDynamicsCrmContact): iPerson => {
        return {
          email: p.emailaddress1 || null,
          fax: p.fax || null,
          firstName: p.firstname || null,
          lastName: p.lastname || null,
          middleName: p.middlename || null,
          personId: p.contactid || null,
          phone: p.mobilephone || null,
          title: p.jobtitle || null,
          userId: p.vsd_bceid || null,
          address: {
            line1: p.address1_line1 || null,
            line2: p.address1_line2 || null,
            city: p.address1_city || null,
            postalCode: p.address1_postalcode || null,
            province: p.address1_stateorprovince || null,
            country: p.address1_country || 'Canada',
          },
        }
      })[0];
  }
}
