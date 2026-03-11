import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NavbarComponent } from './core/navbar/navbar.component';
import { FooterComponent } from './core/footer/footer.component';
import { HomeComponent } from './views/home/home.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SwaggerUiComponent } from './views/swagger-ui/swagger-ui.component';
import { RecaptchaDirective } from './recaptcha.directive';
import { BrowseComponent } from './views/browse/browse.component';
import { AboutComponent } from './views/about/about.component';
import { EntryViewComponent } from './views/entry-view/entry-view.component';
import { EntryDescriptionComponent } from './shared/entry-description/entry-description.component';
import { EntryTabSectionComponent } from './shared/entry-tab-section/entry-tab-section.component';
import { EntryConstructSectionComponent } from './shared/entry-construct-section/entry-construct-section.component';
import { FvDraftAlignmentComponent } from './shared/fv-draft-alignment/fv-draft-alignment.component';
import { EntryEnsemblesSectionComponent } from './shared/entry-ensembles-section/entry-ensembles-section.component';
import { EntryDsspSectionComponent } from './shared/entry-dssp-section/entry-dssp-section.component';
import { EnsembleInfoComponent } from './shared/ensemble-info/ensemble-info.component';
import { AssetsDownloadMenuComponent } from './shared/assets-download-menu/assets-download-menu.component';
import { FvDsspComponent } from './shared/fv-dssp/fv-dssp.component';
import { UniprotProteinViewComponent } from './views/uniprot-protein-view/uniprot-protein-view.component';
import { ProteinCardComponent } from './shared/protein-card/protein-card.component';
import { EnsembleCompactCardComponent } from './shared/ensemble-compact-card/ensemble-compact-card.component';
import { TreeModule } from 'angular-tree-component';
import { EntryFvSectionComponent } from './shared/entry-fv-section/entry-fv-section.component';
import { FvSequenceMergeComponent } from './shared/fv-sequence-merge/fv-sequence-merge.component';
import { HelpComponent } from './views/help/help.component';
import { PageNotFoundComponent } from './views/page-not-found/page-not-found.component';
import { DepositionComponent } from './views/deposition/deposition.component';
import { MatomoModule } from 'ngx-matomo';
import { UniprotSummaryComponent } from './shared/uniprot-summary/uniprot-summary.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { EntryTableViewComponent } from './shared/entry-table-view/entry-table-view.component';


const appRoutes: Routes = [
  {
    path: 'entries/:identifier',
    component: EntryViewComponent
  },
  {
    path: 'proteins/uniprot/:identifier',
    component: UniprotProteinViewComponent
  },
  {
    path: 'browse',
    component: BrowseComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: 'deposition',
    component: DepositionComponent
  },
  {path: 'api', component: SwaggerUiComponent},
  {path: '', component: HomeComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    SwaggerUiComponent,
    RecaptchaDirective,
    AboutComponent,
    EntryViewComponent,
    EntryDescriptionComponent,
    BrowseComponent,
    EntryTabSectionComponent,
    EntryConstructSectionComponent,
    FvDraftAlignmentComponent,
    EntryEnsemblesSectionComponent,
    EntryDsspSectionComponent,
    EnsembleInfoComponent,
    AssetsDownloadMenuComponent,
    FvDsspComponent,
    UniprotProteinViewComponent,
    ProteinCardComponent,
    EnsembleCompactCardComponent,
    EntryFvSectionComponent,
    FvSequenceMergeComponent,
    HelpComponent,
    PageNotFoundComponent,
    DepositionComponent,
    UniprotSummaryComponent,
    EntryTableViewComponent,
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes, {
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
        scrollOffset: [0, 150]
      }
      // { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CdkTableModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TreeModule.forRoot(),
    MatomoModule.forRoot({
      scriptUrl: 'https://matomo.biocomputingup.it/matomo.js',
      trackers: [
        {
          trackerUrl: 'https://matomo.biocomputingup.it/matomo.php',
          siteId: 2,
        },
      ],
      routeTracking: {
        enable: true,
      },
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
