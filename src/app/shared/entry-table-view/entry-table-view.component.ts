import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-entry-table-view',
  templateUrl: './entry-table-view.component.html',
  styleUrls: ['./entry-table-view.component.scss']
})
export class EntryTableViewComponent {
  @Input() entries: any[] = [];
  @Input() sortField: string = 'entry_id';
  @Input() sortOrder: string = 'asc';
  @Output() sort = new EventEmitter<string>();

  constructor() { }

  getProteinACCs(constructChains) {
    let proteins = new Set();
    if (!constructChains) {
      return proteins;
    }
    for (let i = 0; i < constructChains.length; i++) {
      const chain = constructChains[i];
      if (chain && chain["fragments"]) {
        for (let j = 0; j < chain["fragments"].length; j++) {
          const fragment = chain["fragments"][j];
          if (fragment['uniprot_acc']) proteins.add(fragment['uniprot_acc']);
        }
      }
    }
    return proteins;
  }

  getEnsNum(ensembles: Array<Object>): number {
    if (!ensembles) {
      return 0;
    }
    return ensembles.length;
  }

  getEnsConformers(ensembles: Array<Object>): number {
    let count = 0;
    if (!ensembles) {
      return count;
    }
    ensembles.forEach(ens => {
      count += ens['models'];
    });
    return count;
  }

  isPredicted(entryData: any): boolean {
    if (entryData && entryData['description'] && entryData['description']['ensembles_type']) {
      return entryData['description']['ensembles_type'] === 'predicted';
    }
    return false;
  }

  onSort(field: string) {
    this.sort.emit(field);
  }
}
