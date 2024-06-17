import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Coupon } from 'src/app/models/coupon';
import { Page, PageRole } from 'src/app/models/permission';

import { CouponFormComponent } from '../form/form.component';
import { CouponDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { CouponService } from 'src/app/services/firebase/coupon.service';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CouponListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Coupon>;
  displayedColumns: string[] = ['code', 'used', 'quantity', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.CounponPage, PageRole.CanAdd);
  canView = this._permission.check(Page.CounponPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.CounponPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.CounponPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _coupon: CouponService,
    private _permission: PermissionService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._coupon.getAll();
    this.dataSource = new MatTableDataSource<Coupon>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object?: Coupon): void {
    if (this.canView) this._util.detail(CouponDetailComponent, object);
  }

  openForm(object?: Coupon): void {
    this._util.form(CouponFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Coupon): Promise<void> {
    await this._coupon.softDelete(object.id, !object.deletedAt);
    this._util.message(`Cupom ${object.deletedAt ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Coupon): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
