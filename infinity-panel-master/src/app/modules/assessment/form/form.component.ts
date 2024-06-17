import { Component, OnInit, Inject } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Assessment, Group, Instruction } from 'src/app/models/assessment';

import { UtilService } from 'src/app/services/util.service';
import { AssessmentService } from 'src/app/services/firebase/assessment/assessment.service';
import { AssessmentGroupService } from 'src/app/services/firebase/assessment/group.service';
import { AssessmentInstructionService } from 'src/app/services/firebase/assessment/instruction.service';

@Component({
  selector: 'app-assessment-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class AssessmentFormComponent implements OnInit {

  saving = false;
  groups: Group[];
  formGroup: FormGroup;
  types = Assessment.getTypes;
  instructions: Instruction[];
  studentRequireds = Assessment.getStudentRequireds;

  constructor(
    private _util: UtilService,
    private formBuilder: FormBuilder,
    private _group: AssessmentGroupService,
    private _assessment: AssessmentService,
    private _instruction: AssessmentInstructionService,
    private dialogRef: MatDialogRef<AssessmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Assessment = new Assessment()
  ) {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      type: new FormControl('neuro', Validators.required),
      duration: new FormControl('', Validators.required),
      groups: new FormControl([], Validators.required),
      instructions: new FormControl([], Validators.required),
      studentRequireds: new FormControl([]),
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getGroups();
    await this.getInstructions();
    if (this.data.id) this.setData();
  }

  setData(): void {
    this.formGroup.patchValue(this.data);
  }

  get controls() {
    return this.formGroup.controls;
  }

  async getGroups() {
    this.groups = await this._group.getAllActive('name');
  }

  async getInstructions() {
    this.instructions = await this._instruction.getAllActive('title');
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      Object.assign(this.data, this.formGroup.value);

      await this._assessment.save(this.data);

      this.saving = false;
      this._util.message('Questão salva com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
