import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-uniprot-summary',
  templateUrl: './uniprot-summary.component.html',
  styleUrls: ['./uniprot-summary.component.scss']
})
export class UniprotSummaryComponent {
  @Input() proteinData: any;
  @Input() uniprotACC: string;
  @Input() disprotGeneralData: any;
}
