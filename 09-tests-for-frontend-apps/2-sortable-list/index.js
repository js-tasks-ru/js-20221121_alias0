export default class SortableList {
	
	pointerDown = (event) => {
		const li = event.target.closest('.sortable-list__item');

		if (li && event.target.closest('[data-grab-handle]')) {
			event.preventDefault();
			this.dragElem = li;
			
			this.placeholderLi = document.createElement('li');
			this.placeholderLi.className = 'sortable-list__placeholder';
			this.placeholderLi.style.width = li.offsetWidth + 'px';
			this.placeholderLi.style.height = li.offsetHeight + 'px';
			
			this.dragElem.after(this.placeholderLi);
			this.element.append(this.dragElem);
			
			this.dragElemShiftY = this.dragElem.getBoundingClientRect().top;

			document.addEventListener('pointermove', this.pointerMove);
			document.addEventListener('pointerup', this.pointerUp);
			
			
		} else if (li && event.target.closest('[data-delete-handle]')) {
			li.remove();
      }	
	}
	
	pointerMove = (event) => {
		const scrollPx = 10;
		if (event.clientY < (this.dragElem.offsetHeight/2)) {
		  window.scrollBy(0, -scrollPx);
		} else if (event.clientY > document.documentElement.clientHeight - (this.dragElem.offsetHeight/2)) {
		  window.scrollBy(0, scrollPx);
		}
		
		this.dragElem.style.top = (event.clientY - this.dragElemShiftY - (this.dragElem.offsetHeight/2)) + 'px';
		
		const prevLi = this.placeholderLi.previousElementSibling;
		const nextLi = this.placeholderLi.nextElementSibling;
		const firstLi = this.element.firstElementChild;
		const lastLi = this.element.lastElementChild;
		
		if (event.clientY < firstLi.getBoundingClientRect().top) {
			return firstLi.before(this.placeholderLi);
		}
		
		if (event.clientY > lastLi.getBoundingClientRect().bottom) {
			return lastLi.after(this.placeholderLi);
		}
		
		if (prevLi) {
			if (event.clientY < (prevLi.getBoundingClientRect().top + (prevLi.offsetHeight/2)) ) {
				return prevLi.before(this.placeholderLi);
			}
		}
		
		if (nextLi) {
			if (event.clientY > parseInt(nextLi.getBoundingClientRect().top + (nextLi.offsetHeight/2)) ) {
				return nextLi.after(this.placeholderLi);
			}
		}
	}
	
	pointerUp = (event) => {
		this.dragElem.style.top = '';
		this.placeholderLi.replaceWith(this.dragElem);
		document.removeEventListener('pointermove', this.pointerMove);
		document.removeEventListener('pointerup', this.pointerUp);		
	}
	
	constructor ({
				items = []
				} = {}) {
				
		this.items = items;
		this.render();
	}
		
	render() {
		this.element = this.getTemplate();
		this.initEventListeners();		
	}
	
	getTemplate() {
		const ul = document.createElement('ul');
		ul.className = 'sortable-list';
		for(const item of this.items){
			item.className = 'sortable-list__item';
			ul.append(item);
		}
		return ul;
	}
	
	initEventListeners() {	
		this.element.addEventListener('pointerdown', this.pointerDown);
	}	
	
	remove () {
      this.element.remove();
	}

	destroy () {
		this.remove();
		document.removeEventListener('pointermove', this.pointerMove);
		document.removeEventListener('pointerup', this.pointerUp);
	}
}
