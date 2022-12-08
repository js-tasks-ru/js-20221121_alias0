export default class ColumnChart {
	constructor(params) {
		if(typeof params === 'object'){
			for(const [k,v] of Object.entries(params)){
				this[k] = v;
			}
		}
		if(!this.chartHeight)
			this.chartHeight = 50;
		this.render();
		this.initEventListeners();	
	}
	
	getDataList(newData = this.data) {
		const maxValue = Math.max(...newData);
		const scale = parseInt(this.chartHeight) / maxValue;
		return newData.map(item => {
			return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${(item / maxValue * 100).toFixed(0) + '%'}"></div>`  
		}).join('');
	}
	
	getTemplate() {
		let link = (this.link)?this.link:'/#';
		
		let header = (
		this.hasOwnProperty('formatHeading') && 
		typeof this.formatHeading === 'function'
		)?this.formatHeading(this.value):
		this.value;
		
		let haveData = (!this.data || !this.data.length || this.data.length === 0)?false:true;
		let addNoDataClass = (!haveData)?' column-chart_loading':'';
		let entries = (haveData)?this.getDataList():'';
		return `
    <div class="column-chart${addNoDataClass}" style="--chart-height: 50">
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
	}

	update(newData) {
		let columnChart = this.element.querySelector(`.column-chart__chart`);
		columnChart.innerHTML = '';
		if( this.data && this.data.length && this.data.length !== 0){
			columnChart.innerHTML = this.getDataList(newData);
		}
	}

	initEventListeners() {
		
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
	}
}