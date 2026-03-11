import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-deposition',
  templateUrl: './deposition.component.html',
  styleUrls: ['./deposition.component.scss']
})
export class DepositionComponent implements OnInit {

  public activeSection = 'overview';

  constructor(private titleService: Title) {
    this.titleService.setTitle("Deposition - PED");
  }

  ngOnInit(): void {
  }

  public scroll(el: HTMLElement, section?: string): void {
    if (section) {
      this.activeSection = section;
    }
    const y = el.getBoundingClientRect().top + window.scrollY - 75;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

}
