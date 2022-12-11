export default class NotificationMessage {
	
	static prevNotification;
	
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
		if(NotificationMessage.prevNotification){
			NotificationMessage.prevNotification.remove();
		};
		elem.append(this.element);
		NotificationMessage.prevNotification = this;
		this.timerId = setTimeout(() => (this.remove()),this.duration);
	}
	
	remove() {
		clearTimeout(this.timerId)
		this.element.remove();
	}
	
	destroy() {
		this.remove();
	}
	
	
}
