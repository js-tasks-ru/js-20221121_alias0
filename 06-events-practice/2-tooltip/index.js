class Tooltip {
	constructor() {
		if (!Tooltip.instance) {
			Tooltip.instance = this;
		}	
		return Tooltip.instance;
	}	
	
	initialize() {
		document.addEventListener('pointerover', this.over);
		document.addEventListener('pointerout', this.out);		
	}
	
	render() {
		this.element = document.createElement('div');
		this.element.className = 'tooltip';
		document.body.append(this.element);
	}
	
	over(event){
		if(!event.target.dataset.tooltip) return;
		Tooltip.instance.render();
		Tooltip.instance.element.innerHTML = event.target.dataset.tooltip;
		document.addEventListener('pointermove', Tooltip.instance.move);
	}
	
	out(event){
		if (Tooltip.instance.element) {
			Tooltip.instance.remove();
			document.removeEventListener('pointermove', Tooltip.instance.move);
		 }					
	}
	
	move(event){	
		Tooltip.instance.element.style.left = event.clientX + 'px';
		Tooltip.instance.element.style.top = event.clientY + 'px';
	}
	
	remove() {
		this.element.remove();
	}
	
	destroy() {
		this.remove();
		document.removeEventListener('pointerover', this.over);
		document.removeEventListener('pointerout', this.out);
		document.removeEventListener('pointermove', this.move);
	}
}

export default Tooltip;
