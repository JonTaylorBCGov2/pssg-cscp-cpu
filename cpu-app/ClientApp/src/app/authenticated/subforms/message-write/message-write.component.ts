import { Component, OnInit, Input } from '@angular/core';
import { iMessage } from '../../../core/models/message.interface';
import { nameAssemble } from '../../../core/constants/name-assemble';
import { FormHelper } from '../../../core/form-helper';
import { Router } from '@angular/router';
import { StateService } from '../../../core/services/state.service';

@Component({
  selector: 'message-write-card',
  templateUrl: './message-write.component.html',
  styleUrls: ['./message-write.component.css']
})
export class MessageWriteComponent implements OnInit {
  @Input() message: iMessage;
  nameAssemble = nameAssemble;
  public formHelper = new FormHelper();
  constructor(
    private router: Router,
    private stateService: StateService,
  ) { }

  ngOnInit() {
  }

  onExit() {
    if (this.formHelper.isFormDirty()) {
      if (confirm("Are you sure you want to return to the dashboard? All unsaved work will be lost.")) {
        this.stateService.refresh();
        this.router.navigate(['/authenticated/dashboard']);
      }
    }
    else {
      this.stateService.refresh();
      this.router.navigate(['/authenticated/dashboard']);
    }
  }

}
