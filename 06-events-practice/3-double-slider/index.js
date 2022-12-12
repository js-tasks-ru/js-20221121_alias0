export default class DoubleSlider {
	constructor ({
				min = 0,
				max = 100,
				selected = {
					from: min,
					to: max
				},
				formatValue = value => value
				} = {}) {
		this.min = min;	
		this.max = max;	
		this.formatValue = formatValue;	
		this.selected = selected;
		this.pointerDownHandler = this.pointerDown.bind(this);
		this.pointerMoveHandler = this.pointerMove.bind(this);
		this.pointerUpHandler = this.pointerUp.bind(this);
		this.render();
		this.initialize();
	}
	
	initialize() {	
		this.subElements['leftThumb'].addEventListener('pointerdown', this.pointerDownHandler);
		this.subElements['rightThumb'].addEventListener('pointerdown', this.pointerDownHandler);		
		this.subElements['leftThumb'].ondragstart = function() {return false;};
		this.subElements['rightThumb'].ondragstart = function() {return false;};
	}	
	
	getTemplate() {
		const left = this.value2percent( this.selected.from );
		const right = this.value2percent( this.selected.to, true );
		return `<div class="range-slider">
		<span data-element="from">${this.formatValue(this.selected.from)}</span>
		<div class="range-slider__inner">
			<span class="range-slider__progress" style="left: ${left}%; right: ${right}%"></span>
			<span class="range-slider__thumb-left" style="left: ${left}%"></span>
			<span class="range-slider__thumb-right" style="right: ${right}%"></span>
		</div>
		<span data-element="to">${this.formatValue(this.selected.to)}</span>
		</div>`;
	}
	
	render() {
		const element = document.createElement("div");
		element.innerHTML = this.getTemplate();
		this.element = element.firstElementChild;
		this.subElements = this.getSubElements();		
	}
	
	getSubElements() {		
		const result = {};
		result['leftValue'] = this.element.querySelector("span:nth-child(1)");
		result['rightValue'] = this.element.querySelector("div+span");
		result['leftRange'] = this.element.querySelector(".range-slider__progress");
		result['rightRange'] = this.element.querySelector(".range-slider__progress");
		result['leftThumb'] = this.element.querySelector(".range-slider__thumb-left");
		result['rightThumb'] = this.element.querySelector(".range-slider__thumb-right");
		result['range'] = this.element.querySelector(".range-slider__inner");
		return result;
	}
	
	pointerMove(event) {
		const reverseSide = {left: 'right', right: 'left'}
		const side = (this.thumb.className.indexOf('left') === -1) ? 'right' : 'left';
		const slider = this.subElements['range'];
		
        let px = event.clientX - this.shiftX - slider.getBoundingClientRect().left;
		
		/*
		в тестах нулевые значения
		console.log(getComputedStyle(slider).width);
		console.log(slider.offsetWidth);
		console.log(slider.getBoundingClientRect().right-slider.getBoundingClientRect().left);
		*/
        if (px < 0) {
			px = 0;
        }
        const pxMax = slider.offsetWidth;
        if (px > pxMax) {
          px = pxMax;
        }
		
		let percent = (px/pxMax)*100;		
		
		if(side === 'left'){
			 const rightThumbPercent = 100 - parseFloat(this.subElements[reverseSide[side]+'Thumb'].style[reverseSide[side]]);
			 if(percent > rightThumbPercent){
				 percent = rightThumbPercent;
			 }
		} else {
			 const leftThumbPercent = parseFloat(this.subElements[reverseSide[side]+'Thumb'].style[reverseSide[side]]);
			 if(percent < leftThumbPercent){
				 percent = leftThumbPercent;
			 }
		}
		
		const value = this.min + ( ( ( this.max-this.min ) * percent ) / 100 );
		
		const fromRight = (side == 'right') ? true : false;
		if(fromRight){
			percent = 100 - percent;
		}
		this.subElements[side+'Range'].style[side] = parseFloat(percent) + '%';
		this.subElements[side+'Thumb'].style[side] = parseFloat(percent) + '%';		
		this.subElements[side+'Value'].innerHTML = this.formatValue(parseInt(value));
		if(side === 'left'){
			this.selected.from = parseInt(value);
		} else {
			this.selected.to = parseInt(value);
		}
	}
	  
	pointerUp(event) {
		document.removeEventListener('pointerup', this.pointerUpHandler);
        document.removeEventListener('pointermove', this.pointerMoveHandler);	
		const rangeEvent = new CustomEvent("range-select",{
			detail: { from: this.selected.from, to: this.selected.to }
		});
		this.element.dispatchEvent(rangeEvent);
    }

	pointerDown(event) {
		this.shiftX = event.clientX - event.target.getBoundingClientRect().left;
		this.thumb = event.target;
		document.addEventListener('pointermove', this.pointerMoveHandler);
		document.addEventListener('pointerup', this.pointerUpHandler);
	}
	
	value2percent( value, fromRight=false ) {
		let percent = ( ( ( value-this.min ) / ( this.max-this.min ) ) * 100 );
		percent = (!fromRight) ? percent : 100 - percent
		if ( percent > 100 ) percent = 100;
		if ( percent < 0 ) percent = 0;
		
		return  percent;
	}
	
	remove() {
		this.element.remove();
	}
	
	destroy() {
		document.removeEventListener('pointerup', this.pointerUpHandler);
        document.removeEventListener('pointermove', this.pointerMoveHandler);
		this.subElements['leftThumb'].removeEventListener('pointerdown', this.pointerDownHandler);
		this.subElements['rightThumb'].removeEventListener('pointerdown', this.pointerDownHandler);
		this.remove();
	}
}
