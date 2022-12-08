export default class NotificationMessage {
	
	static haveOne = false;
	
	constructor(message = '', {
		duration = 1000,
		type = 'success'		
	} = {}) {
		this.duration = parseInt(duration);
		this.message = message;
		this.type = type;
		this.render();			
	}
	
	getTemplate() {
		return `
    <div class="notification ${this.type}" style="--value:${parseInt(this.duration / 1000)}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.message}
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
	
	show(elem = document.body) {
		if(NotificationMessage.haveOne) return;
		NotificationMessage.haveOne = true;
		elem.append(this.element);
		setTimeout(() => (this.remove()),this.duration)
	}
	
	remove() {
		this.element.remove();
		NotificationMessage.haveOne = false;
	}
	
	destroy() {
		this.remove();
	}
	
	
}
