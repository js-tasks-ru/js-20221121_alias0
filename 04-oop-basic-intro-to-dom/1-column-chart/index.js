export default class ColumnChart {
	constructor({
				data = [],
				label = "",
				link = "",
				value = 0,
				chartHeight = 50,
				formatHeading = data => data
				} = {}) {
		this.data = data;
		this.label = label;
		this.link = link;
		this.chartHeight = chartHeight;
		this.value = formatHeading(value);	
		this.render();	
	}
	
	getDataList(newData = this.data) {
		const maxValue = Math.max(...newData);
		const scale = parseInt(this.chartHeight) / maxValue;
		return newData.map(item => {
			return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${(item / maxValue * 100).toFixed(0) + '%'}"></div>`  
		}).join('');
	}
	
	getTemplate() {
		const link = (this.link)?this.link:'/#';
		
		const header = (
		this.hasOwnProperty('formatHeading') && 
		typeof this.formatHeading === 'function'
		) ? this.formatHeading(this.value) : this.value;
		
		const haveData = (!this.data || !this.data.length || this.data.length === 0)?false:true;
		const addNoDataClass = (!haveData)?' column-chart_loading':'';
		const entries = (haveData)?this.getDataList():'';
		return `
    <div class="column-chart${addNoDataClass}" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        <a href="${link}" class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${header}</div>
        <div data-element="body" class="column-chart__chart">
		${entries}
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

	update(newData) {
		this.subElements.body.innerHTML = '';
		if( this.data && this.data.length && this.data.length !== 0){
			this.subElements.body.innerHTML = this.getDataList(newData);
		}
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