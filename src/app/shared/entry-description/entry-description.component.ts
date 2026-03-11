import { Component, Input, OnInit } from '@angular/core';
import { Collapse } from 'node_modules/bootstrap/dist/js/bootstrap.esm.min.js';

@Component({
  selector: 'app-entry-description',
  templateUrl: './entry-description.component.html',
  styleUrls: ['./entry-description.component.scss']
})
export class EntryDescriptionComponent implements OnInit {

  @Input() entryId: string;
  @Input() descriptionObj: object;

  // Track expanded state for method descriptions
  expandedMethods: { [key: string]: boolean } = {
    experimental: false,
    ensemble: false,
    md: false
  };

  // Track expanded state for tags
  expandedTags: { [key: string]: boolean } = {
    experimental: false,
    ensemble: false,
    md: false
  };

  constructor() { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

  }

  isPredicted(): boolean {
    if (this.descriptionObj && this.descriptionObj['ensembles_type']) {
      return this.descriptionObj['ensembles_type'] === 'predicted';
    }
    return false;
  }

  toggleMethodExpand(method: string): void {
    this.expandedMethods[method] = !this.expandedMethods[method];
  }

  toggleTagsExpand(method: string): void {
    this.expandedTags[method] = !this.expandedTags[method];
  }

  getTagCount(namespace: string): number {
    if (!this.descriptionObj || !this.descriptionObj['ontology_terms']) return 0;
    return this.descriptionObj['ontology_terms'].filter(t => t['namespace'] === namespace).length;
  }

  toogleCollapse(id): void {
    const myCollapse = document.getElementById(id);
    const bsCollapse = new Collapse(myCollapse, { toggle: false });
    bsCollapse.toggle();
  }

}
