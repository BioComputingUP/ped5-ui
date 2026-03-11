import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Block } from 'notiflix';
import { InternalService } from 'src/app/services/internal.service';

const VALID_SEARCH_AREAS = ["free_text", "term", "cross_ref", "entry_id", "uniprot_acc", "protein_name", "publication_identifier", "publication_html", "data_owner"];

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

  public searchForm: FormGroup;

  public currentEntryType: string = 'total';
  public resultData = [];
  public itemsCount = 0;
  public itemsPerPage = 20;
  public curPageNum = 1;
  public viewMode = 'card';
  private sortField = "entry_id";
  private sortOrder = "asc"; 


  constructor(private titleService: Title, private internalService: InternalService,
    public route: ActivatedRoute, private fb: FormBuilder,
    public router: Router) {
    this.titleService.setTitle("Browse - PED");
    this.searchForm = this.fb.group({
      entryType: 'total',
      params: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(new_params => {
      console.log("new_params")
      console.log(new_params)
      this.parseParamsToForm(new_params);

      let filter = this.parseFormToFilter()
      this.searchEntries(this.curPageNum, this.itemsPerPage, this.sortField, this.sortOrder, filter)


      if (this.searchParams.length <= 0) {
        this.addSearchField("free_text");
      }
    })
  }

  changeViewMode(mode: string) {
    this.viewMode = mode;
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.searchEntries(this.curPageNum, this.itemsPerPage, this.sortField, this.sortOrder, this.parseFormToFilter());
  }


  parseParamsToForm(query_params) {
    if (query_params.hasOwnProperty('entryType')) {
      this.searchForm.get('entryType')?.setValue(query_params['entryType'], { emitEvent: false });
    } else {
      this.searchForm.get('entryType')?.setValue('total', { emitEvent: false });
    }

    this.searchParams.clear();
    
    Object.keys(query_params).forEach(param => {
      if (VALID_SEARCH_AREAS.includes(param)) {
        if(Array.isArray(query_params[param])){
          query_params[param].forEach(value => {
            this.searchParams.push(this.fb.group({
              "area": param,
              "key": value
            }), { emitEvent: false })
          })
        }else{
          this.searchParams.push(this.fb.group({
            "area": param,
            "key": query_params[param]
          }), { emitEvent: false })
        }
      }
      if (param === "limit") this.itemsPerPage = parseInt(query_params[param]);
      if (param === "page") this.curPageNum = parseInt(query_params[param]);
    })
  }

  parseFormToFilter(): object {
    let filter = {};
    
    this.searchParams.value.forEach((currItem) => {
      if (currItem.key) {
        if (!filter.hasOwnProperty(currItem.area)) {
          filter[currItem.area] = [];
        }
        filter[currItem.area].push(currItem.key);
      }
    });
    
    filter['entryType'] = this.searchForm.get('entryType')?.value;
    return filter;
  }

  pageChanged(event: PageChangedEvent | any): void {
    this.curPageNum = event.page;
    console.log("Page change event")
    this.changeQueryParams(this.curPageNum, this.itemsPerPage);
  }

  changeLimit(new_limit) {
    this.changeQueryParams(1, new_limit);
  }


  doSearch() {
    this.changeQueryParams(1, this.itemsPerPage);
  }

  changeQueryParams(page, limit){
    let filter = this.parseFormToFilter();
    let filter_params = {
      ...filter,
      limit: limit,
      page: page,
    }

    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: filter_params
      });
  }

  searchEntries(page = 0, limit = 20, sort_field = "entry_id", sort_order = "asc", params = {}) {
    Block.standard("#browser")
    this.internalService.searchEntries({
      offset: (page - 1) * limit,
      limit: limit,
      sort_field: sort_field,
      sort_order: sort_order,
      ...params
    }).subscribe(responseData => {
      console.log(responseData)
      this.itemsCount = responseData["count"]
      let data = responseData["result"]


      this.resultData = data; 
      console.log(this.resultData);
      
      this.curPageNum = page
      Block.remove("#browser") 
    });
  }


  // Search Form Functions

  get searchParams() {
    return this.searchForm.get("params") as FormArray;
  }

  getCurrentEntryType(): string {
    return this.currentEntryType;
  }

  addSearchField(area, key = null) {
    this.searchParams.push(this.fb.group({
      area: area,
      key: key ? key : null
    }));
  }

  removeSearchField(index) {
    this.searchParams.removeAt(index);
    if (this.searchParams.length === 0) {
      this.addSearchField('free_text');
    }
    this.doSearch();
  }

  getActiveFilters() {
    // Exclude the first search param, which is the main keyword search
    return this.searchParams.value.slice(1);
  }

  onAreaChange(index: number) {
    const paramGroup = this.searchParams.at(index) as FormGroup;
    if (paramGroup.get('key').value) {
      this.doSearch();
    }
  }

  // Format functions

  getProteinACCs(consructChains) {
    let proteins = new Set();
    if (!consructChains) {
      return proteins;
    }
    for (let i = 0; i < consructChains.length; i++) {
      const chain = consructChains[i];
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
    return ensembles.length
  }

  getEnsConformers(ensembles: Array<Object>): number {
    let count = 0;
    if (!ensembles) {
      return count;
    }
    ensembles.forEach(ens => {
      count += ens['models'];
    })
    return count;
  }

  isPredicted(entryData: any): boolean {
    if (entryData && entryData['description'] && entryData['description']['ensembles_type']) {
      return entryData['description']['ensembles_type'] === 'predicted';
    }
    return false;
  }
}
