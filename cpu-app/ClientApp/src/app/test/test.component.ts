import { Component, OnInit } from '@angular/core';
import { ProgramApplicationService } from '../core/services/program-application.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  dynamics;
  transmogrified;
  constructor(
    private programApplicationService: ProgramApplicationService
  ) { }
  ngOnInit() {
    this.programApplicationService.getScheduleF('9e9b5111-51c9-e911-b80f-00505683fbf4').subscribe(f => {
      this.dynamics = f;
      this.transmogrified = f;
    })
  }
}
