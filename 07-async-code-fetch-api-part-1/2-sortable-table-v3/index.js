import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
	constructor(headerConfig, {
				url = '',
				isSortLocally = false,
				data = [],
				sorted = {
							id: headerConfig.find(item => item.sortable).id,
							order: 'asc'
						 }
				} = {}) {
		this.headerConfig = headerConfig;
		this.url = url;
		this.data = data;
		this.sorted = sorted;
		this.start = 0;
		this.loadAmount = 30;
		this.end = this.start + this.loadAmount;
		this.isSortLocally = isSortLocally;
		this.render();
	}

	sortOnClient(id, order) {
		this.subElements.body.innerHTML = this.getBody();
	}

	async sortOnServer(id, order) {
		const newData = await this.loadData();
		if(!newData.length){
			this.subElements.emptyPlaceholder.style.display = 'block';
		} else {
			this.data = newData;
			this.subElements.body.innerHTML = this.getBody();
		}
	}
	
	async loadData(addData = false) {
		this.subElements.emptyPlaceholder.style.display = 'none';
		this.subElements.loading.style.display = 'block';
		if(!addData){
			this.subElements.body.innerHTML = '';
			this.start = 0;
			this.end = this.start + this.loadAmount;
		} else {
			this.start += this.loadAmount;
			this.end = this.start + this.loadAmount;
		}
		const url = new URL(BACKEND_URL+'/'+this.url);
		url.searchParams.set('_embed', 'subcategory.category');
		url.searchParams.set('_sort', this.sorted.id);
		url.searchParams.set('_order', this.sorted.order);
		url.searchParams.set('_start', this.start);
		url.searchParams.set('_end', this.end);
		const json = await fetchJson(url);
		this.subElements.loading.style.display = 'none';
		return json;
	}
	  
	sortArray(arr) {
		if(!this.isSortLocally) return arr;
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
		<div data-element="body" class="sortable-table__body"></div>
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
			return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="asc"><span>${item.title}</span>${this.getArrow(item)}</div>`
		}).join('');
	}
	
	getArrow(item) {
		if(!item.sortable || this.sorted.id !== item.id) return '';
		return `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;
	}
	
	getBody(data = this.data) {
		return this.sortArray(data).map(dataItem => {
			const subItems = this.headerConfig.map(headerItem => {
				if(headerItem.template) return headerItem.template(dataItem[headerItem.id]);
				return `<div class="sortable-table__cell">${dataItem[headerItem.id]}</div>`;
			}).join('');
			
			return `<a href="/products/${dataItem.id}" class="sortable-table__row">
				${subItems}
			</a>`;
		}).join('');
	}

	async render() {
		const element = document.createElement("div");
		element.innerHTML = this.getTemplate();
		this.element = element.firstElementChild;
		this.subElements = this.getSubElements();
		this.initEventListeners();
		this.data = await this.loadData();
		if(!this.data.length){
			this.subElements.emptyPlaceholder.style.display = 'block';
		}
		this.subElements.body.innerHTML = this.getBody(this.data);
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
	
	initEventListeners() {
		this.subElements.header.addEventListener("pointerdown", (event) => {
			const toSort = event.target.closest('[data-sortable=true]');
			if(!toSort) return false;
			const reverse = {asc:'desc', desc:'asc'};
			this.sorted.id = toSort.dataset.id;
			this.sorted.order = toSort.dataset.order = reverse[toSort.dataset.order];
			toSort.append(this.subElements.arrow);
			if(!this.isSortLocally){
				this.sortOnServer(this.sorted.id, this.sorted.order);
			} else {
				this.sortOnClient(this.sorted.id, this.sorted.order);
			}
		});
		window.addEventListener("scroll", async (event) => {
			if(window.pageYOffset > (this.element.scrollHeight - document.documentElement.clientHeight - 200)){	
				document.body.style.overflow = 'hidden';
				const newData = await this.loadData(true);
				if(newData.length){
					const div = document.createElement('div');
					div.innerHTML = this.getBody(newData);
					this.subElements.body.append(div);
				}
				document.body.style.overflow = '';
			}
		});
	}

	destroy() {
		this.element.remove();
	}
}
