import {
  Component,
  Output,
  EventEmitter,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit,
  Input
} from '@angular/core';

const Fuse = require('fuse.js');

const MetaKeyCodes = [91, 17];
const PKeyCode = 80;
const ESCKeyCode = 27;

const UpArrowKeyCode = 38;
const DownArrowKeyCode = 40;

export interface KeyValuePair<T> {
  key: string;
  value: T;
}

export interface QueryObject {
  [index: number]: string[];
}

@Component({
  selector: 'ngrev-quick-access',
  template: `
    <div class="fuzzy-box" *ngIf="fuzzyBoxVisible" (click)="$event.stopImmediatePropagation()">
      <input autofocus #input type="text" [(ngModel)]="symbolName">
      <ngrev-quick-access-list
        *ngIf="search() as results"
        [style.display]="results.length ? 'block' : 'none'"
        [data]="results"
        (select)="select.next($event); hide()"
      >
      </ngrev-quick-access-list>
    </div>
  `,
  host: {
    '(document:keydown)': 'onKeyDown($event)',
    '(document:keyup)': 'onKeyUp($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
  styles: [`
  :host {
    margin: auto;
    margin-top: 45px;
    position: absolute;
    top: 0; left: 0; bottom: 0; right: 0;
    width: 70%;
    height: calc(100% - 45px);
  }
  .fuzzy-box {
    padding: 5px;
    width: 100%;
    max-height: 80%;
    box-shadow: 0 0 11px 3px #ccc;
    background: #fff;
    display: flex;
    flex-direction: column;
  }
  .fuzzy-box input {
    max-height: 60px;
    font-size: 35px;
    outline: none;
    border: 1px solid #ccc;
  }
  `]
})
export class QuickAccessComponent implements AfterViewInit {
  private metaKeyDown = 0;
  private fuzzyBoxVisible = false;
  private symbolName = '';
  private fuse = new Fuse([], { keys: ["name", "filePath"] });

  @Input() set queryObject(query: QueryObject) {
    let list = [];
    if (this.fuse) {
      list = this.fuse.list;
    }
    this.fuse = new Fuse(list, { keys: query });
  }

  @Input() set queryList(symbols: KeyValuePair<any>[]) {
    this.fuse.set(symbols);
  }

  @Output() select = new EventEmitter<string>();
  @ViewChildren('input') input: QueryList<ElementRef>;

  onKeyDown(e) {
    if (MetaKeyCodes.indexOf(e.keyCode) >= 0) {
      this.metaKeyDown = e.keyCode;
    }
    if (e.keyCode === PKeyCode && this.metaKeyDown) {
      this.fuzzyBoxVisible = true;
    }
    if (e.keyCode === ESCKeyCode) {
      this.hide();
    }
    if (e.keyCode === DownArrowKeyCode || e.keyCode === UpArrowKeyCode) {
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    if (MetaKeyCodes.indexOf(e.keyCode) >= 0 && this.metaKeyDown === e.keyCode) {
      this.metaKeyDown = 0;
    }
  }

  ngAfterViewInit() {
    this.input.changes
      .subscribe(e => e.first ? e.first.nativeElement.focus() : void 0);
  }

  search() {
    return this.fuse.search(this.symbolName);
  }

  onDocumentClick() {
    this.hide();
  }

  private hide() {
    this.fuzzyBoxVisible = false;
    this.symbolName = '';
  }
}