/** @format */

"use strict";

(function () {
	const todoList = {
		formId: null,
		form: null,
		todosContainerId: "todoItems",
		todoContainer: null,
		currentItemId: null,
		removeAllBtn: null,

		findForm() {
			const form = document.getElementById(this.formId);

			if (form === null || form.nodeName !== "FORM") {
				throw new Error("There is no such form on the page");
			}

			this.form = form;
			return form;
		},

		getTodosContainer() {
			const container = document.getElementById(this.todosContainerId);
			container ? (this.todoContainer = container) : null;
			console.log(container);
		},

		getRemoveAllBtn() {
			this.removeAllBtn = this.form.querySelector(".remove-all");
		},

		findInputsData() {
			return Array.from(
				this.form.querySelectorAll("input[type=text], textarea")
			).reduce((acc, item) => {
				acc[item.name] = item.value;
				return acc;
			}, {});
		},

		addFormHandler() {
			this.form.addEventListener("submit", event =>
				this.formHandler(event)
			);

			this.todoContainer.addEventListener(
				"change",
				this.checkTodoItem.bind(this)
			); ////////?

			this.todoContainer.addEventListener(
				"click",
				this.removeElement.bind(this)
			);

			this.removeAllBtn.addEventListener(
				"click",
				this.removerAllTodos.bind(this)
			);
		},

		preFillTodoList() {
			document.addEventListener(
				"DOMContentLoaded",
				this.preFillHandler.bind(this)
			);
		},

		preFillHandler() {
			const data = this.getData();
			console.log(data);

			data.forEach(todoItem => {
				const template = this.createTemplate(todoItem);
				document.getElementById("todoItems").prepend(template);
			});
		},

		formHandler(event) {
			event.preventDefault();
			this.currentItemId += 1;
			// заканчиваем

			let data = {
				id: this.formId,
				completed: false,
				itemId: this.currentItemId,
				...this.findInputsData(),
			};
			console.log(data);

			this.setData(data);
			const template = this.createTemplate(data);
			document.getElementById("todoItems").prepend(template);
			event.target.reset();
		},

		checkTodoItem({ target }) {
			const itemId = target.getAttribute("data-item-id");
			if (!itemId) throw new Error("itemId is not defined");

			const status = target.checked;
			const data = JSON.parse(localStorage.getItem(this.formId));

			const currentItem = data.find(
				todoItem => todoItem.itemId === +itemId
			);

			currentItem.completed = status;
			localStorage.setItem(this.formId, JSON.stringify(data));
		},

		removeElement({ target }) {
			if (!target.classList.contains("delete-btn")) return;
			const itemsId = target.getAttribute("data-item-id");
			console.log(itemsId);
			if (!itemsId) throw new Error("No id provided");

			const data = JSON.parse(localStorage.getItem(this.formId));
			const currentItemIndex = data.findIndex(
				todoItem => todoItem.itemsId === +itemsId
			);

			data.splice(currentItemIndex, 1);

			localStorage.setItem(this.formId, JSON.stringify(data));

			function findParentElByClass(currentElement, parentClassName) {
				if (currentElement === null) return null;

				if (currentElement.classList.contains(parentClassName)) {
					return currentElement;
				}

				return findParentElByClass(
					currentElement.parentElement,
					parentClassName
				);
			}

			const todoItemContainer = findParentElByClass(
				target,
				"taskWrapper"
			);

			todoItemContainer.parentElement.remove();
		},

		removerAllTodos() {
			const data = JSON.parse(localStorage.getItem(this.formId));
			console.log(data);
			data.splice(0, data.length);

			localStorage.setItem(this.formId, JSON.stringify(data));
			this.todoContainer.innerHTML = "";
		},

		setData(data) {
			if (!localStorage.getItem(this.formId)) {
				let arr = [];
				arr.push(data);

				localStorage.setItem(this.formId, JSON.stringify(arr));

				return;
			}

			let existingData = localStorage.getItem(this.formId);
			existingData = JSON.parse(existingData);
			existingData.push(data);
			localStorage.setItem(this.formId, JSON.stringify(existingData));
		},

		getData() {
			return JSON.parse(localStorage.getItem(this.formId));
		},

		findInputs(target) {
			return target.querySelectorAll(
				"input:not([type=submit]), textarea"
			);
		},

		init(todoListFormID) {
			if (
				typeof todoListFormID !== "string" ||
				todoListFormID.length === 0
			) {
				throw new Error("Todo list ID is not valid");
			}

			this.formId = todoListFormID;
			this.findForm();
			this.getTodosContainer();
			this.getRemoveAllBtn();
			this.addFormHandler();
			this.preFillTodoList();
		},

		createTemplate({ title, description, itemId, completed }) {
			const wrapper = document.createElement("div");
			wrapper.classList.add("col-4");

			let wrapInnerContent = '<div class="taskWrapper">';
			wrapInnerContent += `<div class="taskHeading">${title}</div>`;
			wrapInnerContent += `<div class="taskDescription">${description}</div>`;
			// Добавляем элемент checkbox в функцию генерации темплейта
			wrapInnerContent += `<hr>`;
			wrapInnerContent += `<label class="completed form-check">`;
			// Создаем внутри инпута кастовмный аттрибут в которы ложим id текущего todoItem
			wrapInnerContent += `<input data-item-id="${itemId}" type="checkbox" class="form-check-input" >`;
			wrapInnerContent += `<span>Завершено ?</span>`;
			wrapInnerContent += `</label>`;
			// Заканчиваем добавлять checkbox
			// Добавляем кнопку удаления и id текущего todoItem в качестве аттрибута
			wrapInnerContent += `<hr>`;
			wrapInnerContent += `<button class="btn btn-danger delete-btn" data-item-id="${itemId}">Удалить</button>`;
			// Заканчиваем с кнопкой удаления
			wrapInnerContent += "</div>";

			wrapper.innerHTML = wrapInnerContent;

			wrapper.querySelector("input[type=checkbox]").checked = completed;

			return wrapper;
		},

		createElement(nodeName, classes, innerContent) {
			const el = document.createElement(nodeName);

			if (Array.isArray(classes)) {
				classes.forEach(singleClassName => {
					el.classList.add(singleClassName);
				});
			} else {
				el.classList.add(classes);
			}

			if (innerContent) {
				el.innerHTML = innerContent; // fix this
			}

			return el;
		},
	};

	todoList.init("todoForm");
})();
