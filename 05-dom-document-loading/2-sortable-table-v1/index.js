export default class SortableTable {
	constructor(headerConfig = [], data = []) {
		this.headerConfig = headerConfig;
		this.data = data;
		this.render();
	}

	sortArray(arr) {
		if(!this.field || !this.order) return arr;
		const directions = {
			asc: 1,
			desc: -1
		};	
		const direction = directions[this.order];
		
		let rule = 'string';
		for (const column of this.headerConfig){
			if( column.id === this.field && column.sortable){
				rule = column.sortType;
			}
		}
		const rules = {
			string: (a, b) => direction * a[this.field].localeCompare( b[this.field], ['ru','en'], { caseFirst: 'upper' }),
			number: (a, b) => direction * (a[this.field] - b[this.field]),
			date: (a, b) => direction * (new Date(a[this.field]) - new Date(b[this.field]))
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
			const order = (this.field === item.id) ? `data-order="${this.order}"` : '';
			return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" ${order}} ><span>${item.title}</span>${this.getArrow(item)}</div>`
		}).join('');
	}
	
	getArrow(item) {
		if(!item.sortable || this.field !== item.id) return '';
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
	
	sort(fieldValue, orderValue) {
		this.field = fieldValue;
		this.order = orderValue;
		this.subElements.header.innerHTML = this.getHeader();
		this.subElements.body.innerHTML = this.getBody();
	}

	destroy() {
		this.element.remove();
	}
}

