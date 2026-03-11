import {Component, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import {Router} from '@angular/router';
import {InternalService} from '../../services/internal.service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public searchFormControl = new FormControl();
  public typeFilterControl = new FormControl('total');
  public serverName = null;
  public statsData = {};
  public latestEntries: any[] = [];
  public lastUpdated: string = '';
  public currentYear = new Date().getFullYear();
  public ws: string;

  constructor(private titleService: Title, private router: Router, private internalService: InternalService
  ) {
    this.titleService.setTitle('Home - PED');
    this.ws = this.internalService.ws;
  }

  ngOnInit(): void {
    // Notify.info('Welcome! You are on the new version of PED. You can access the legacy version at <a href="https://old.proteinensemble.org/" style="color: white"><strong>https://old.proteinensemble.org/</strong></a>.', {
    //   position: 'right-bottom',
    //   plainText: false,
    //   messageMaxLength: 1000,
    //   // timeout: 10000,
    //   // clickToClose: true,
    //   closeButton: true,
    //   showOnlyTheLastOne: true,
    //   useIcon: false,
    //   info: {
    //     background: '#2274a5'
    //   }
    // });

    this.internalService.getServerName().subscribe(
      responseData => {
        this.serverName = responseData;
      },
      e => {
      },
      () => {
      });

    this.internalService.getHomeStats().subscribe(
      data => {
        this.statsData = data;
      }
    );

    this.internalService.searchEntries({ offset: 0, limit: 5, sort_field: 'entry_id', sort_order: 'desc' }).subscribe(
      data => {
        this.latestEntries = data.result || [];
        if (this.latestEntries.length > 0) {
          // Fetch individual entry details to get creation_date for each card
          const detailRequests = this.latestEntries.map(e => this.internalService.getPublicEntry(e.entry_id));
          forkJoin(detailRequests).subscribe(details => {
            details.forEach((detail: any, i) => {
              if (detail?.creation_date) {
                this.latestEntries[i].creation_date = detail.creation_date;
              }
            });
            // Sort by creation_date descending (newest first)
            this.latestEntries.sort((a, b) => {
              const dateA = a.creation_date ? new Date(a.creation_date).getTime() : 0;
              const dateB = b.creation_date ? new Date(b.creation_date).getTime() : 0;
              return dateB - dateA;
            });
            // Set lastUpdated from the first (newest) entry
            const first = this.latestEntries[0];
            if (first.creation_date) {
              const d = new Date(first.creation_date);
              this.lastUpdated = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            }
          });
        }
      }
    );
  }

  getEntryThumbUrl(entry: any): string {
    const ens = entry.ensembles?.[0];
    const chain = ens?.chains?.[0]?.chain_name || 'A';
    return `${this.ws}entries/${entry.entry_id}/ensembles/${ens?.ensemble_id}/chains/${chain}/ensemble-animation/`;
  }

  getTotalConformers(entry: any): number {
    if (!entry.ensembles) return 0;
    return entry.ensembles.reduce((sum, e) => sum + (e.models || 0), 0);
  }

  goToBrowsePage(): number {
    // check PED identifier
    if (/^PED\d{5}$|^PED\d{5}e\d{3}$/.test(this.searchFormControl.value)) {
      this.router.navigate(['entries/' + this.searchFormControl.value]);
      return 0;
    }
    // check UniProt ACC
    if (/^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/.test(this.searchFormControl.value)) {
      this.router.navigate(['proteins/uniprot/' + this.searchFormControl.value]);
      return 0;
    }
    const queryParams: any = { free_text: this.searchFormControl.value };
    if (this.typeFilterControl.value && this.typeFilterControl.value !== 'total') {
      queryParams.entryType = this.typeFilterControl.value;
    }
    this.router.navigate(['browse'], { queryParams });
  }

}
