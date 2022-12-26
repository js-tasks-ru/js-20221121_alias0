import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

	getTemplate () {
		return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
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
	
	render() {	
		const element = document.createElement("div");
		element.innerHTML = this.getTemplate();
		this.element = element.firstElementChild;
		this.subElements = this.getSubElements()
		this.initComponents();
		this.initEventListeners();
		return this.element;
	}
	
	initComponents() {	
		const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth() - 1));
		
		const rangePicker = new RangePicker({from, to});
		const sortableTable = new SortableTable(header, {
			url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}&_sort=title&_order=asc&_start=0&_end=30`,
			isSortLocally: true
		});
			
		const ordersChart = new ColumnChart({
			url: 'api/dashboard/orders',
			range: {
				from,
				to
			},
			label: 'orders',
			link: '#'
		});
	  
		const salesChart = new ColumnChart({
			url: 'api/dashboard/sales',
			range: {
				from,
				to
			},
			label: 'sales',
			formatHeading: data => `$${data}`
		});

		const customersChart = new ColumnChart({
			url: 'api/dashboard/customers',
			range: {
				from,
				to
			},
			label: 'customers',
		});
		
		this.components = {
		  rangePicker,
		  sortableTable,
		  ordersChart,
		  salesChart,
		  customersChart
		};
		
		Object.keys(this.components).forEach(component => {
			this.subElements[component].append(this.components[component].element);
		});
	}
		
	initEventListeners() {
		this.components.rangePicker.element.addEventListener('date-select', event => {
			this.update(event.detail.from, event.detail.to);
		});
	}
	
	async update(from, to) {
		const url = new URL('api/dashboard/bestsellers', BACKEND_URL);
		url.searchParams.set('from', from.toISOString());
		url.searchParams.set('to', to.toISOString());
		url.searchParams.set('_sort', 'title');
		url.searchParams.set('_order', 'asc');
		url.searchParams.set('_start', '0');
		url.searchParams.set('_end', '30');			
		const data = await fetchJson(url);

		this.components.sortableTable.update(data);
		this.components.ordersChart.update(from, to);
		this.components.salesChart.update(from, to);
		this.components.customersChart.update(from, to);
	}
	
	remove() {
      this.element.remove();
	}

	destroy() {
		this.remove();
		Object.values(this.components).forEach(component => {
			component.destroy()
		});
	}
}
