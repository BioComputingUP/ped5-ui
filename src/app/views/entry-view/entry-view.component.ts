import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Block } from 'notiflix';
import { InternalService } from 'src/app/services/internal.service';
import dataRecord from '../../../assets/bioschemas/dataRecord.json';

@Component({
  selector : 'app-entry-view',
  templateUrl : './entry-view.component.html',
  styleUrls : ['./entry-view.component.scss'],
})
export class EntryViewComponent implements OnInit {

  public entryID;
  public entryData;
  public downloadAllLink;
  public activeSection = 'overview';

  constructor(private titleService: Title,
              private internalService: InternalService,
              private route: ActivatedRoute) {
    this.entryID = this.route.snapshot.paramMap.get('identifier');
    this.titleService.setTitle('Entry ' + this.entryID + ' - PED');
    this.downloadAllLink = this.internalService.ws + 'entries/' + this.entryID + '/download-ensembles/';
  }

  ngOnInit(): void {
    Block.standard('#result-view');
    this.internalService.getPublicEntry(this.entryID).subscribe(data => {
      this.entryData = data;
      this.createBioschemas(data);
      Block.remove('#result-view');
    }, this.internalService.basicErrorHandler);
  }

  scroll(el: HTMLElement, section?: string): void {
    if (section) {
      this.activeSection = section;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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


  private createBioschemas(entryObj: any): void {
    if (document.getElementById('dataRecord')) {
      document.getElementById('dataRecord').remove();
    }

    let listTerms = [];
    if (Array.isArray(entryObj.description.ontology_terms)) {
      listTerms = listTerms.concat(entryObj.description.ontology_terms.map(term => {
        return {
          '@type' : 'PropertyValue',
          '@id' : 'https://proteinensemble.org/#IDPO:' + term.id,
          name : term.name,
          value : term.name,
          valueReference : {
            '@type' : 'DefinedTerm',
            '@id' : 'https://disprot.org/IDPO/IDPO:' + term.id,
            inDefinedTermSet : {
              '@type' : 'DefinedTermSet',
              '@id' : 'https://disprot.org/assets/data/IDPO_v0.3.0.owl',
              name : 'IDP ontology',
            },
            termCode : 'IDPO:' + term.id,
            name : term.name,
          },
        };
      }));
    }

    dataRecord.additionalProperty = listTerms;

    const studySubjects = [];
    if (Array.isArray(entryObj.construct_chains)) {
      entryObj.construct_chains.forEach(currChain => {
        const listFragments = [];
        if (Array.isArray(currChain.fragments)) {
          currChain.fragments.forEach(currFragment => {
            if (currFragment.uniprot_acc?.length > 0) {
              if (!listFragments.find(frag => frag['@id'] === `ped:${entryObj.entry_id}#${currFragment.uniprot_acc}`)) {
                listFragments.push(
                  {
                    '@type' : 'Protein',
                    '@id' : `ped:${entryObj.entry_id}#${currFragment.uniprot_acc}`,
                    'dc:conformsTo' : {
                      '@id' : 'https://bioschemas.org/profiles/Protein/0.11-RELEASE',
                      '@type' : 'CreativeWork',
                    },
                    identifier : 'https://identifiers.org/uniprot:' + currFragment.uniprot_acc,
                    sameAs : 'http://purl.uniprot.org/isoforms/' + (currFragment.uniprot_acc.includes('-') ?
                      currFragment.uniprot_acc : currFragment.uniprot_acc + '-1'),
                    hasBioPolymerSequence : currFragment.source_sequence,
                  },
                );
              }
            }
          });
        }
        studySubjects.push({
          '@type' : 'BioChemEntity',
          '@id' : 'ped:' + entryObj.entry_id + '#' + currChain.chain_name,
          'dc:conformsTo' : {
            '@id' : 'https://bioschemas.org/types/BioChemEntity/0.8-DRAFT',
            '@type' : 'CreativeWork',
          },
          identifier : `ped:PED00014#${currChain.chain_name}`,
          hasBioChemEntityPart : listFragments,
        });
      });
    }

    dataRecord['@id'] = 'ped:' + entryObj.entry_id;
    dataRecord.identifier = 'https://identifiers.org/ped:' + entryObj.entry_id;
    dataRecord.name = entryObj.entry_id;
    dataRecord.datePublished = entryObj.creation_date;
    dataRecord.description = entryObj.description.title;
    dataRecord.studySubject = studySubjects;

    dataRecord.subjectOf = [];
    if (entryObj.description.publication_source !== null) {
      dataRecord.subjectOf.push({
        '@id' : (entryObj.description.publication_source === 'pubmed' ?
          'https://identifiers.org/pubmed:' : 'https://doi.org/') + entryObj.description.publication_identifier,
        '@type' : 'ScholarlyArticle',
      });
    }
    entryObj.description.experimental_cross_reference?.forEach(currRef => {
      dataRecord.subjectOf.push({
        '@id' : currRef.db === 'bmrb' ? `https://bmrb.io/data_library/summary/index.php?bmrbId=${currRef.id}` :
          ('https://identifiers.org/' + currRef.db + ':' + currRef.id),
        '@type' : 'WebPage',
      });
    });
    if (dataRecord.subjectOf.length === 0) {
      delete dataRecord.subjectOf;
    }

    const scriptTag = document.createElement('script'); // creates the script tag
    scriptTag.text = JSON.stringify(dataRecord); // sets the source (insert url in between quotes)
    scriptTag.type = 'application/ld+json'; // set the script type
    scriptTag.id = 'dataRecord'; // set the script type

    scriptTag.async = true; // makes script run asynchronously
    document.getElementsByTagName('head')[0].appendChild(scriptTag);
  }
}
