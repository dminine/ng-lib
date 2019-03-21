import { EventEmitter, Output, Input } from '@angular/core';


export abstract class PaginatorBlockBaseComponent {
  @Input()
  get totalCount(): number { return this._totalCount; }
  set totalCount(totalCount: number) {
    if (totalCount) {
      this._totalCount = totalCount;
      this.totalPage = Math.ceil(this.totalCount / this.perPage);

      if (this.currentPage > this.totalPage) {
        this.changePage(this.totalPage);
      } else {
        this.makeBlock();
      }
    }
  }
  private _totalCount: number;

  @Input() currentPage = 1;
  @Input() perPage = 10;
  @Input() perBlock = 10;

  @Output() pageChange = new EventEmitter<number>();

  totalPage: number;
  currentBlock: number[] = [];
  currentBlockIndex = 0;

  changePage(page: number) {
    this.currentPage = page;
    this.makeBlock();
    this.pageChange.emit(page);
  }

  protected makeBlock() {
    this.currentBlockIndex = Math.ceil(this.currentPage / this.perBlock) - 1;

    const blockLength = this.totalPage - (this.currentBlockIndex * this.perBlock) < this.perBlock
      ? this.totalPage - (this.currentBlockIndex * this.perBlock)
      : this.perBlock;

    this.currentBlock = new Array(blockLength)
      .fill(0)
      .map((value, index) => (this.currentBlockIndex * this.perBlock) + index + 1);
  }
}
