export default class RangePicker {
	
	closeSelector = (event) => {
		if(this.element.classList.contains('rangepicker_open') && !event.target.closest('.rangepicker__selector') && !event.target.closest('.rangepicker__input')){
			this.subElements.selector.innerHTML = '';
			this.element.classList.remove('rangepicker_open');
		}
	}
	
	openSelector = (event) => {
		this.element.classList.toggle('rangepicker_open');
		this.subElements.selector.innerHTML = this.getCalendar();
	}
	
	clickSelector = (event) => {
		const click = event.target;			
		if(click.closest('.rangepicker__selector-control-left')){
			this.getCalendar(-1);
		} else if(click.closest('.rangepicker__selector-control-right')){
			this.getCalendar(1);
		} else if(click.closest('.rangepicker__cell')){
			const selectedDate = click.closest('.rangepicker__cell');
			if(!this.setDates){
				const buttons = this.subElements.selector.querySelectorAll('.rangepicker__cell');
				const classNames = ['from', 'to', 'between'];
				for (const button of buttons){
					for (const className of classNames){
						if(button.classList.contains('rangepicker__selected-'+className)){
							button.classList.remove('rangepicker__selected-'+className);
						}
					}
				}				
				this.from = new Date(selectedDate.dataset.value);
				this.from.setHours(0);
				this.to = this.from;
				selectedDate.classList.add('rangepicker__selected-from');
				this.setDates = true;
			}else{
				const secondDate = new Date(selectedDate.dataset.value);
				secondDate.setHours(0);
				if(secondDate >= this.from){
					this.to = secondDate;
				} else {
					this.to = this.from;
					this.from = secondDate;
				}
						
				const buttons = this.subElements.selector.querySelectorAll('.rangepicker__cell');
				for (const button of buttons){
					let className = 'rangepicker__cell';
					let ceilDate = new Date(button.dataset.value);
					ceilDate.setHours(0);
					if( !(this.from - ceilDate) ){
						className = className + ' rangepicker__selected-from';
					}
					if( !(ceilDate - this.to) ){
						className = className + ' rangepicker__selected-to';
					}
					if( ceilDate < this.to && ceilDate > this.from){
						className = className + ' rangepicker__selected-between';
					}
					button.className = className;
				}
				this.setDates = false;
						
				const datePickerEvent = new CustomEvent('date-select', { from: this.from, to: this.to });
				this.element.dispatchEvent(datePickerEvent);
						
				this.subElements.from.innerHTML = this.getBeautyDate(this.from);
				this.subElements.to.innerHTML = this.getBeautyDate(this.to);
					
				this.element.classList.remove('rangepicker_open');
			}
		}
	}
	
	constructor ({
				from = new Date(),
				to = new Date()
				} = {}) {
				
		this.from = from;	
		this.to = to;
		
		this.firstMonthDate = new Date(this.to);
		this.secondMonthDate = new Date(this.to);
		this.firstMonthDate.setMonth(this.firstMonthDate.getMonth() - 1);
		this.setDates = false;
		this.render();
		this.initEventListeners();
	}
	
	getBeautyDate(date, d='.') {
		let day = date.getDate();
		if(day < 10){
			day = '0'+day;
		}
		let month = date.getMonth()+1;
		if(month < 10){
			month = '0'+month;
		}
		const year = date.getFullYear();
		
		return day+d+month+d+year;
	}
	
	initEventListeners() {	
		this.subElements.input.addEventListener("click", this.openSelector);
		document.addEventListener("click", this.closeSelector, {capture: true});
		this.subElements.selector.addEventListener("click", this.clickSelector);
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
	
	getTemplate() {
		return `<div class="rangepicker">
    <div class="rangepicker__input" data-element="input">
      <span data-element="from">${this.getBeautyDate(this.from)}</span> -
      <span data-element="to">${this.getBeautyDate(this.to)}</span>
    </div>
    <div class="rangepicker__selector" data-element="selector"></div>
	 </div>`;
	}
	
	getLastDayOfMonth(year, month) {
		const date = new Date(year, month + 1, 0);
		return date.getDate();
	}
	
	getLocalDay(date) {
		let day = date.getDay();
		if (day == 0) {
			day = 7;
		}
		return day;
	}
	
	getCalendar(diff = 0) {
		if(diff !== 0){	
			this.firstMonthDate.setMonth(this.firstMonthDate.getMonth() + diff);		
			this.secondMonthDate.setMonth(this.secondMonthDate.getMonth() + diff);
			
			this.subElements.selector.querySelector('.rangepicker__calendar:nth-last-child(2)').innerHTML = this.getCalendarMonth(this.firstMonthDate);
			this.subElements.selector.querySelector('.rangepicker__calendar:nth-last-child(1)').innerHTML = this.getCalendarMonth(this.secondMonthDate);		
			return;			
		}
		return `<div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
		<div class="rangepicker__calendar">${this.getCalendarMonth(this.firstMonthDate)}</div>
		<div class="rangepicker__calendar">${this.getCalendarMonth(this.secondMonthDate)}</div>`;
	}
	
	getCalendarMonth(date) {
		const monthName = new Date(date).toLocaleString('ru', { month: 'long' });
		const daysInMonth = this.getLastDayOfMonth(date.getFullYear(),date.getMonth());
		let buttons = [];
		
		for(let d=1; d<=daysInMonth; d++){
			let style = (d === 1)?` style="--start-from: ${this.getLocalDay(new Date(date.getFullYear(),date.getMonth(),1))}"`:'';
			let className = '';
			if( !(this.from - new Date(date.getFullYear(),date.getMonth(),d)) ){
				className = className + ' rangepicker__selected-from';
			}
			if( !(new Date(date.getFullYear(),date.getMonth(),d) - this.to) ){
				className = className + ' rangepicker__selected-to';
			}
			if( new Date(date.getFullYear(),date.getMonth(),d) < this.to && new Date(date.getFullYear(),date.getMonth(),d) > this.from){
				className = className + ' rangepicker__selected-between';
			}
			
			buttons.push(`<button type="button" class="rangepicker__cell${className}" data-value="${new Date(date.getFullYear(),date.getMonth(),d,12).toISOString()}"${style}>${d}</button>`);
		}
		
		 return `<div class="rangepicker__month-indicator">
          <time datetime="${monthName}">${monthName}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
		${buttons.join('')}
		</div>
		`;
	}
	
	remove() {
		this.element.remove();
	}
	
	destroy() {
		this.subElements.input.removeEventListener("click", this.openSelector);
		document.removeEventListener("click", this.closeSelector, {capture: true});
		this.subElements.selector.removeEventListener("click", this.clickSelector);
		this.remove();
	}
}
