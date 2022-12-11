class Tooltip {
	constructor() {
		if (!Tooltip.instance) {
			Tooltip.instance = this;
		}	
		return Tooltip.instance;
	}
	
	
	initialize() {
		const div = document.querySelector('[data-tooltip]');
			
		function over(event){	
			Tooltip.instance.render();
			Tooltip.instance.element.innerHTML = event.target.dataset.tooltip;
			document.addEventListener('pointermove', move);
		}		
		function out(event){	
			Tooltip.instance.destroy();
			document.removeEventListener('pointermove', move);
		}
		function move(event){	
			Tooltip.instance.element.style.left = event.clientX + 'px';
			Tooltip.instance.element.style.top = event.clientY + 'px';
		}
		
		div.addEventListener('pointerover', over);
		div.addEventListener('pointerout', out);		
	}
	
	render() {
		this.element = document.createElement('div');
		this.element.className = 'tooltip';
		document.body.append(this.element);
	}
	
	destroy() {
		this.element.remove();
	}
}

export default Tooltip;
