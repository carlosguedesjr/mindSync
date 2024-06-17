import { Component, OnInit, EventEmitter, Output } from '@angular/core';

import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();

  constructor(
    private _auth: AuthService
  ) { }

  ngOnInit(): void {
    const width = window.innerWidth;
    if (width <= 960 && !this.toggleSideBarForMe.closed) this.toggleSideBar();
  }

  toggleSideBar(): void {
    this.toggleSideBarForMe.emit();
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  }

  logout(): void {
    this._auth.signOut();
  }
}
