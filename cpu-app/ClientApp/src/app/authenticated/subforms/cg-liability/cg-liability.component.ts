import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppendixADialog } from '../../dialogs/appendix-a/appendix-a.dialog';

@Component({
  selector: 'app-cg-liability',
  templateUrl: './cg-liability.component.html',
  styleUrls: ['./cg-liability.component.css']
})
export class CgLiabilityComponent implements OnInit {
  @Input() cgLiability: string;
  @Output() cgLiabilityChange = new EventEmitter<string>();
  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
  }

  onChanges() {
    this.cgLiabilityChange.emit(this.cgLiability);
  }

  showAppendixADialog() {
    this.dialog.open(AppendixADialog, {
      autoFocus: false,
      data: {}
    });
  }
}
