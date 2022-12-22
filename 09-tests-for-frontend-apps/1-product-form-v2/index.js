import SortableList from '../../2-sortable-list/src/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
	
	save = async () => {
		const urlSave = new URL('api/rest/products', BACKEND_URL);
		const productForm = this.getFormElements();
		
		const method = this.productId ? "PATCH" : "PUT";
		const saveForm = await fetchJson(urlSave, {method:method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(productForm)});
		
		this.dispatchEvent('someData');
	}
	
	dispatchEvent = (someData) => {
		let productEventName = '';
		if(this.productId){
			productEventName = 'product-updated';
		} else {
			productEventName = 'product-saved';
		}
		const productEvent = new CustomEvent(productEventName, {detail: someData});
		this.element.dispatchEvent(productEvent)	
	}
	
	getFormElements = () => {
		const productForm = {};
		['title', 'description', 'subcategory', 'price', 'discount', 'quantity', 'status'].map( item => {
			const value = (this.subElements.productForm.elements[item].type === 'number') ? parseInt(this.subElements.productForm.elements[item].value) : this.subElements.productForm.elements[item].value;
			productForm[item] =  value;
		}); 
		productForm.images = [];
		
		const inputs = this.subElements.imageListContainer.querySelectorAll('li>input');
		for (let i=0; i < inputs.length; i++){
			productForm.images.push({source: inputs[i+1].value, url: inputs[i].value});
			i++;
		}
		productForm.status = parseInt(productForm.status);
		if(this.productId){
			productForm.id = this.productId;
		}
		return productForm;
	}
	
	uploadImage = async () => {
		if(!this.subElements.uploadFile.files[0]) return false;
		
		this.subElements.productForm.uploadImage.classList.add("is-loading");
		
		const postData = new FormData;
		postData.append("image", this.subElements.uploadFile.files[0]);					
		const uploadImage = await fetchJson('https://api.imgur.com/3/image', {method:"POST", headers:{Authorization:'Client-ID '+IMGUR_CLIENT_ID}, body:postData});
		
		this.subElements.imageListContainer.querySelector('.sortable-list').append(this.getImageTemplate(uploadImage.data.link, uploadImage.data.id));
		
		this.subElements.productForm.uploadImage.classList.remove("is-loading");		
	}
		
	constructor (productId) {
		this.productId = productId;
	}
	
	getTemplate() {
		return `<div class="product-form"><form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
		<input type="file" accept="image/*" hidden data-element="uploadFile">
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" id="subcategory" name="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>
		`;
	}
	
	getImageTemplate(url, source) {
		const li = document.createElement('li');
		li.setAttribute('class', 'products-edit__imagelist-item sortable-list__item');
		li.innerHTML = `<input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${source}">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
        <span>${escapeHtml(source)}</span>
      </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>`;
		return li;
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
	
	async getCategoriesData() {
		const urlCategories = new URL('api/rest/categories', BACKEND_URL);
		urlCategories.searchParams.set('_sort', 'weight');
		urlCategories.searchParams.set('_refs', 'subcategory');
		return await fetchJson(urlCategories);
	}
	
	async getProductData() {
		if(!this.productId) return {};
		const urlProduct = new URL('api/rest/products', BACKEND_URL);
		urlProduct.searchParams.set('id', this.productId);
		return await fetchJson(urlProduct);		
	}
	
	fillCategories = (categories) => {
		categories.map(category => {
			category.subcategories.map( subcategory => {
				this.subElements.productForm.elements.subcategory.append(new Option(category.title+' > '+subcategory.title, subcategory.id));
			})
		});
	}
	
	fillProductData = (productData) => {
		Object.entries(productData[0]).map( ([key, value]) => {
			if(this.subElements.productForm.elements[key]){
				this.subElements.productForm.elements[key].value = (String(value));
			}
		});
	}
	
	renderImages = (images) => {
		if(images.length !== 0){
			const sortableList = new SortableList({
				items: images.map(image => this.getImageTemplate(image.url, image.source))
			});			
			this.subElements.imageListContainer.append(sortableList.element);
		}
	}
	
	async render () {
		const element = document.createElement("div");
		element.innerHTML = this.getTemplate();
		this.element = element.firstElementChild;
		this.subElements = this.getSubElements();
		
		const [categories, productData] = await Promise.all([this.getCategoriesData(), this.getProductData()]);
		
		this.fillCategories(categories);
		this.fillProductData(productData);
		this.renderImages(productData[0].images);
		
		this.initEventListeners();
		return this.element;
	}
	
	initEventListeners() {
		this.subElements.productForm.elements.uploadImage.addEventListener("pointerdown", () => {this.subElements.uploadFile.click()});
		this.subElements.uploadFile.addEventListener("change", this.uploadImage);
		this.subElements.productForm.addEventListener("submit", this.save);
		
		this.subElements.productForm.addEventListener("submit", () => event.preventDefault());
	}
	
	destroy() {
		this.element.remove();
	}
	
	remove() {
		this.element.remove();
	}
}
