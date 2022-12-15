import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
	constructor({
				url = '',
				range = {},
				label = "",
				link = "",
				value = 0,
				chartHeight = 50,
				formatHeading = data => data
				} = {}) {
		this.url = url;
		this.range = range;
		this.label = label;
		this.link = link;
		this.chartHeight = chartHeight;
		this.value = formatHeading(value);	
		this.render();	
	}
	
	getDataList(newData) {
		const maxValue = Math.max(...newData);
		const scale = parseInt(this.chartHeight) / maxValue;
		return newData.map(item => {
			return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${(item / maxValue * 100).toFixed(0) + '%'}"></div>`  
		}).join('');
	}
	
	getTemplate() {
		return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        <a href="/#" class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>
    </div>
    `;
	}

	render() {
		const element = document.createElement("div");
		element.innerHTML = this.getTemplate();
		this.element = element.firstElementChild;
		this.subElements = this.getSubElements();
	}
		
	async update(dateStart, dateEnd) {	
		const url = new URL(BACKEND_URL+'/api/dashboard/orders');
		url.searchParams.set('from', dateStart.toISOString());
		url.searchParams.set('to', dateEnd.toISOString());
		const json = await fetchJson(url);
		const newData = Object.values(json);
		const isSkeleton = (this.element.classList.contains('column-chart_loading'))?true:false;
		let header = 0;
		this.value = 0;
		if(!newData.length) {
			if(!isSkeleton) {
				this.element.classList.add('column-chart_loading');
			}
		} else {
			this.value = newData.length;
			header = ( this.hasOwnProperty('formatHeading') && 
							typeof this.formatHeading === 'function'
						 ) ? this.formatHeading(this.value) : this.value;
			if(isSkeleton) {
				this.element.classList.remove('column-chart_loading');
			}
		}
		this.subElements.header.innerHTML = header;
		this.subElements.body.innerHTML = this.getDataList(newData);
		return json;
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
  
	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
	}
}
