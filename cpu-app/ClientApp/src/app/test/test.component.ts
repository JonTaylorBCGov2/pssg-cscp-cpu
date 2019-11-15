import { Component, OnInit } from '@angular/core';
import { MainService } from '../core/services/main.service';
import { Transmogrifier } from '../core/models/transmogrifier.class';
import { ProfileService } from '../core/services/profile.service';
import { PersonService } from '../core/services/person.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  // store the results
  trans: Transmogrifier;
  orgChange: string;

  bceid: string;
  constructor(
    private mainService: MainService,
    private profileService: ProfileService,
    private personService: PersonService,
  ) { }
  ngOnInit() {
    this.bceid = "9e9b5111-51c9-e911-b80f-00505683fbf4";
    this.orgChange = `{
  "BCeID": "9e9b5111-51c9-e911-b80f-00505683fbf4",
  "StaffCollection": [
    {
    "contactid": "foo",
    "statuscode": 1
    }
  ]
}`;
    this.refresh();
  }

  postOrg() {
    this.profileService.updateOrg(JSON.parse(this.orgChange)).subscribe(o => {
      console.log(o);
      this.refresh();
    },
      err => alert(JSON.stringify(err))
    );
  }
  postUsers() {
    this.personService.setPersons(JSON.parse(this.orgChange)).subscribe(o => {
      console.log(o);
      this.refresh();
    },
      err => alert(JSON.stringify(err))
    );
  }

  refresh() {
    //set the current object
    this.mainService.getBlob(this.bceid).subscribe(t => {
      this.trans = new Transmogrifier(t);
    });
  }
}
