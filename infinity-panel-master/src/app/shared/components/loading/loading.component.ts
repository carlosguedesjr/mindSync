import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-loading-dialog',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  msg: string;
  loader = true;
  loaderOpts: AnimationOptions = {path: '/assets/lottie/loading.json'};
  successOpts: AnimationOptions = {
    loop: false,
    path: '/assets/lottie/success.json'
  };

  constructor(
    private ngZone: NgZone,
    private dialogRef: MatDialogRef<LoadingComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {msg: string},
  ) {}

  ngOnInit(): void {
    this.msg = this.data.msg;
  }

  done(): void {
    this.loader = false;
  }

  close(): void {
    this.ngZone.run(_ => {
      this.dialogRef.close();
    });
  }
}
