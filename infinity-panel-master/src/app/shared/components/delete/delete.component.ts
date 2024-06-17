import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormBuilder, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';

// VALIDATOR
export function confirmValidator(nameConfirm: string): ValidatorFn {
  return (control: FormControl): ValidationErrors | null => {
    return (control.value && control.value !== nameConfirm) ? {invalid: true} : null;
  };
}

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {

  formGroup: FormGroup;
  placeholder: string;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<DeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {action: 'enable' | 'disable' | 'delete'},
  ) {
    if (this.data.action === 'enable') this.placeholder = 'ATIVAR';
    else if (this.data.action === 'disable') this.placeholder = 'DESATIVAR';
    else if (this.data.action === 'delete') this.placeholder = 'EXCLUIR';

    this.formGroup = this.formBuilder.group({
      confirm: new FormControl('', [Validators.required, confirmValidator(this.placeholder)]),
    });
  }

  ngOnInit(): void { }

  get controls() {
    return this.formGroup.controls as {confirm: FormControl};
  }

  onSubmit(): void {
    this.dialogRef.close(true);
  }
}
