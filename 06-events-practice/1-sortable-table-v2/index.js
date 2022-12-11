export default class SortableTable {
	constructor(headerConfig = [], {
				data = [],
				sorted = {}
				} = {}) {
		this.headerConfig = headerConfig;
		this.data = data;
		this.sorted = sorted;
		this.isSortLocally = true;
		this.render();
		this.initEventListeners();
	}
	
	sortArray(arr) {
		if(!this.sorted.id || !this.sorted.order) return arr;
		const directions = {
			asc: 1,
			desc: -1
		};	
		const direction = directions[this.sorted.order];
		
		let rule = 'string';
		for (const column of this.headerConfig){
			if( column.id === this.sorted.id && column.sortable){
				rule = column.sortType;
			}
		}
		const rules = {
			string: (a, b) => direction * a[this.sorted.id].localeCompare( b[this.sorted.id], ['ru','en'], { caseFirst: 'upper' }),
			number: (a, b) => direction * (a[this.sorted.id] - b[this.sorted.id]),
			date: (a, b) => direction * (new Date(a[this.sorted.id]) - new Date(b[this.sorted.id]))
		}
		
		return [...arr].sort( rules[rule] );	
	}
	
	getTemplate() {
		return `<div data-element="productsContainer" class="products-list__container">
	<div class="sortable-table">
		<div data-element="header" class="sortable-table__header sortable-table__row">
			${this.getHeader()}
		</div>	
		<div data-element="body" class="sortable-table__body">
			${this.getBody()}
		</div>
		<div data-element="loading" class="loading-line sortable-table__loading-line"></div>
		<div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
			<div>
				<p>No products satisfies your filter criteria</p>
				<button type="button" class="button-primary-outline">Reset all filters</button>
			</div>
		</div>
	</div>
</div>`;
	}
	
	getHeader() {
		return this.headerConfig.map(item => {
			const order = (this.sorted.id === item.id) ? `data-order="${this.sorted.order}"` : '';
			return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="asc"} ><span>${item.title}</span>${this.getArrow(item)}</div>`
		}).join('');
	}
	
	getArrow(item) {
		if(!item.sortable || this.sorted.id !== item.id) return '';
		return `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;
	}
	
	getBody() {
		return this.sortArray(this.data).map(dataItem => {
			const subItems = this.headerConfig.map(headerItem => {
				if(headerItem.template) return headerItem.template(dataItem.images);
				return `<div class="sortable-table__cell">${dataItem[headerItem.id]}</div>`;
			}).join('');
			
			return `<a href="/products/${dataItem.id}" class="sortable-table__row">
				${subItems}
			</a>`;
		}).join('');
	}

	render() {
		const element = document.createElement("div");
		element.innerHTML = this.getTemplate();
		this.element = element.firstElementChild;
		this.subElements = this.getSubElements();
	}
	
	getSubElements() {
		const result = {};
		const elements = this.element.querySelectorAll("[data-element]");

		for (const subElement of elements) {
		  const name = subElement.dataset.element;
		  result[name] = subElement;
		}
		return result;
	}
	
	sort(elem) {
		const reverse = {asc:'desc', desc:'asc'};
		this.sorted.id = elem.dataset.id;
		this.sorted.order = elem.dataset.order = reverse[elem.dataset.order];
		elem.append(this.subElements.arrow);		
		this.subElements.body.innerHTML = this.getBody();
	}

	initEventListeners() {
		const headers = this.subElements.header.querySelectorAll('[data-id]');
		for (const header of headers){
			if(header.dataset.sortable !== 'false'){
				header.addEventListener("pointerdown", () => this.sort(header));
			}
		}
	}

	destroy() {
		this.element.remove();
	}
}
