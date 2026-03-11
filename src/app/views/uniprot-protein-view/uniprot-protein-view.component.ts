import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Block } from 'notiflix';
import { ExternalService } from 'src/app/services/external.service';
import { InternalService } from 'src/app/services/internal.service';

@Component({
  selector: 'app-uniprot-protein-view',
  templateUrl: './uniprot-protein-view.component.html',
  styleUrls: ['./uniprot-protein-view.component.scss']
})
export class UniprotProteinViewComponent implements OnInit {
  public uniprotACC;
  public proteinData;
  public disprotGeneralData;
  public entriesData = [];
  public entriesLoading = true;
  public activeSection = 'summary';

  constructor(private externalService: ExternalService, private titleService: Title, private internalService: InternalService,
    private route: ActivatedRoute) {
    this.uniprotACC = this.route.snapshot.paramMap.get('identifier');
    this.titleService.setTitle("Protein " + this.uniprotACC + " - PED");

  }

  ngOnInit(): void {
    Block.standard("#summary")
    Block.standard("#entries")


    // Get Uniprot data
    this.externalService.getUniprotData(this.uniprotACC).subscribe(protein_raw_data => {
      let protein_data = {};
      if (protein_raw_data.length !== 1) {
        protein_data = null;
      }
      protein_data['accession'] = protein_raw_data[0].accession;
      protein_data['function'] = '';
      protein_raw_data[0].comments.forEach(currComment => {
        if (currComment['type'] === 'FUNCTION') {
          protein_data['function'] += currComment['text'].map(currText => currText.value);
        }
      });

      protein_data['organism_name'] = protein_raw_data[0].organism.names[0].value;
      protein_data['organism_taxon'] = protein_raw_data[0].organism.taxonomy;
      protein_data['sequence'] = protein_raw_data[0].sequence.sequence;
      try {
        protein_data['name'] = protein_raw_data[0].protein.recommendedName.fullName.value;
      } catch (e) {
        try {
          protein_data['name'] = protein_raw_data[0].protein.alternativeName[0].fullName.value;
        } catch (e) {
          protein_data['name'] = '';
        }
      }
      this.proteinData = protein_data;
      Block.remove("#summary")
    });


    // Get DisProt data
    this.externalService.getDisprotProtData(this.uniprotACC, { get_consensus: 'true', namespace: 'stuctural_state' }).subscribe(raw_disprot_data => {

      if (raw_disprot_data && raw_disprot_data.hasOwnProperty('disprot_consensus')) {
        // this.disprotData.next(raw_disprot_data['disprot_consensus']['structural_state']);
        this.disprotGeneralData = raw_disprot_data;
      } else {
        // this.disprotData.next([]);
      }
    });


    // Get entries involved
    this.internalService.searchEntries({ limit: 1000, uniprot_acc: this.uniprotACC}).subscribe( pedData => {
      this.entriesData = pedData['result'];
      this.entriesLoading = false;
      Block.remove("#entries")
    });
  }

  public scroll(el: HTMLElement, section?: string): void {
    if (section) {
      this.activeSection = section;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}
