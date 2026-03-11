import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { InternalService } from 'src/app/services/internal.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  public nodes;
  public activeSection = 'overview';
  options = {
    animateExpand: true,
    animateSpeed: 30,
    levelPadding: 20,
  }; // the tree visualization options

  listToTree_options = {
    idKey: 'id', // The field in the term object to consider as ID
    parentKey: 'parentId', // The field in the term object to consider as parent reference
    childrenKey: 'children' // this has to be exactly "children" to get the tree rendering
  };

  ontologyFilterFrom;

  constructor(private internalService: InternalService,
              private fb: FormBuilder,
              private titleService: Title) {
    this.titleService.setTitle('About - PED');
   }

   ngOnInit() {
    this.ontologyFilterFrom = this.fb.control('');

    this.internalService.getOntology().subscribe(result => {
      // console.log(result);
      const nodes_flat = [];

      result.forEach((node) => {
        if ('is_a' in node) {
          node.is_a.forEach((parentId) => {
            nodes_flat.push({
              id: node.id,
              name: node.name,
              def: node.definition,
              parentId
            });
          });
        } else {
          nodes_flat.push({
            id: node.id,
            name: node.name,
            def: node.definition
          });
        }
      });
      // console.log(nodes_flat);

      nodes_flat.sort((a, b) => {
        let a_index = ['Measurement method',
          'Ensemble generation method', 'Molecular dynamics'].indexOf(a.name);
        let b_index = ['Measurement method', 'Ensemble generation method',
          'Molecular dynamics'].indexOf(b.name);
        if (a_index === -1) {
          a_index = 999;
        }
        if (b_index === -1) {
          b_index = 999;
        }
        if (a_index < b_index) {
          return -1;
        } else {
          return 1;
        }
      });

      console.log(nodes_flat.slice(0, 10));

      this.nodes = this.listToTree(nodes_flat, this.listToTree_options);
      // console.log(this.nodes);
    },
      err => {
        // TODO
      },
      () => {
        // TODO
        // console.log('Finished');
      });
  }

  listToTree(data, options) {
    options = options || {};
    const ID_KEY = options.idKey || 'id';
    const PARENT_KEY = options.parentKey || 'parent';
    const CHILDREN_KEY = options.childrenKey || 'children';

    const tree = [], childrenOf = {};
    let item, id, parentId;

    for (let i = 0, length = data.length; i < length; i++) {
      item = data[i];
      id = item[ID_KEY];
      parentId = item[PARENT_KEY] || null;
      // every item may have children
      childrenOf[id] = childrenOf[id] || [];
      // init its children
      item[CHILDREN_KEY] = childrenOf[id];
      if (parentId != null) {
        // init its parent's children object
        childrenOf[parentId] = childrenOf[parentId] || [];
        // push it into its parent's children object
        childrenOf[parentId].push(item);
      } else {
        tree.push(item);
      }
    }
    return tree;
  }

  clearSearch() {
    this.ontologyFilterFrom.setValue('');
  }

  public scrollTo(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.activeSection = sectionId;
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
