import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import { Dropdown, Collapse } from 'bootstrap';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  profileObj;
  url = '';
  currentUser = {};
  previousPosition = 0;
  isMenuOpen = false;
  private routerSubscription: Subscription;

  constructor(public router: Router) {
  }

  ngOnInit(): void {
    // Close menu on route change
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMenu();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleUserDropDown(menuID): void {
    const myDropdown = new Dropdown( document.getElementById(menuID));
    myDropdown.toggle();
  }
}
