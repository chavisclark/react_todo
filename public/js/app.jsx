/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

var app = app || {};
 					   						   
(function () {
	'use strict';
	// Setting global variables for app
	app.ALL_TODOS = 'all';
	app.ACTIVE_TODOS = 'active';
	app.COMPLETED_TODOS = 'completed';
	app.NO_CATEGORY = {id: 'none', name: 'None', color: 'none'};
	app.ALL_CATEGORIES = {id: 'all', name: 'All Categories', color: ''};
    app.CATEGORIES = [
      {id: 'fs', name: 'fsociety', color: 'black'},
      {id: 'ec', name: 'E Corp', color: 'green'}, 
  	  {id: 'tw', name: 'Tyrell Wellick', color: 'gold'},
  	  {id: 'mr', name: 'Mr. Robot', color: 'maroon'}, 
  	  {id: 'ea', name: 'Elliot Alderson', color: 'blue'},
  	  {id: 'tda', name: 'The Dark Army', color: 'indigo'}
    ];
	app.GLOBAL_CATEGORIES = [];
    for (var i = 0; i < app.CATEGORIES.length; i++) {
      app.GLOBAL_CATEGORIES.push(app.CATEGORIES[i]);
    }
    app.GLOBAL_CATEGORIES.unshift(app.ALL_CATEGORIES);
    app.GLOBAL_CATEGORIES.push(app.NO_CATEGORY)
  	
  	var TodoFooter = app.TodoFooter,
  		TodoItem = app.TodoItem,
  		ENTER_KEY = 13;

	var TodoApp = React.createClass({
		getInitialState: function () {
			return {
				nowShowing: app.ALL_TODOS,
				currentCategory: app.ALL_CATEGORIES,
				editing: null,
				newTodo: '',
				newTodoCategory: app.NO_CATEGORY
			};
		},

		// Configuring the router for displaying inital filters for todos
		componentDidMount: function () {
			var setState = this.setState;
			var router = Router({
				'/': setState.bind(this, {nowShowing: app.ALL_TODOS}),
				'/active': setState.bind(this, {nowShowing: app.ACTIVE_TODOS}),
				'/completed': setState.bind(this, {nowShowing: app.COMPLETED_TODOS})
			});
			router.init('/');
		},

		// Function that handles the change from the todo input event
		handleChange: function (event) {
			this.setState({newTodo: {title: event.target.value}});
		},
		// Function that handles the submit for the todo input
		handleNewTodoKeyDown: function (event) {
			if (event.keyCode !== ENTER_KEY) {
				return;
			}

			// Disabling default behavior of the enter key
			event.preventDefault();

			// Checking to make sure the input field is not empty
			if (!this.state.newTodo.title) {
				alert("Oops! You forgot to write something in there.")
			}

			// Creating new variables for the current state
			var newTitle = this.state.newTodo.title.trim(),
			    newCategory = this.state.newTodoCategory ? this.state.newTodoCategory : app.NO_CATEGORY,
			    newTodo = this.state.newTodo;
			
			// Adding new properties to the newTodo object
			newTodo.title = newTitle;
			newTodo.category = newCategory;

			if (newTodo) {
				// Updating the model and setting the next state to the current 
				this.props.model.addTodo(newTodo);
				this.setState({
				  newTodo: '',
				  currentCategory: newCategory,
				  newTodoCategory: newCategory
				});
			}
		},

		// The following functions are acting on the model 
		toggleAll: function (event) {
			var checked = event.target.checked;
			this.props.model.toggleAll(checked);
		},

		toggle: function (todoToToggle) {
			this.props.model.toggle(todoToToggle);
		},

		destroy: function (todo) {
			this.props.model.destroy(todo);
		},

		edit: function (todo) {
			this.setState({editing: todo.id});
		},

		save: function (todoToSave, text) {
			this.props.model.save(todoToSave, text);
			this.setState({editing: null});
		},

		cancel: function () {
			this.setState({editing: null});
		},

		clearCompleted: function () {
			this.props.model.clearCompleted();
		},

		// Function handles the category selection for the newTodo
		handleCategorySelect: function (event) {
		  // Filter the categories to find the matching id and return the first object
	      var newCategoryFilter = app.CATEGORIES.filter(function (category) {
	        return category.id === event.target.value;
	      });
	    
		  this.setState({newTodoCategory: newCategoryFilter[0]});
		},

		handleCategoryView: function (event) {
		  // Filter the global categories which include 'All Categories' and 'None'
          var newCategoryFilter = app.GLOBAL_CATEGORIES.filter(function (category) {
            return category.id === event.target.value;
          });
	  
	      this.setState({currentCategory: newCategoryFilter[0]});
		},
		
		render: function () {
			var footer, 
			    main, 
			    todos = this.props.model.todos, 
			    selectedCategory = this.state.currentCategory;

			// Filters todos from model and switches the url based on specific conditons
			// Status x Category 
			var shownTodos = todos.filter(function (todo) {
				switch (this.state.nowShowing) {
				case app.ALL_TODOS:
				if (selectedCategory && selectedCategory.color){
					return todo.category.color === selectedCategory.color
				} else {
					return todo
				}
				case app.ACTIVE_TODOS:
				if (selectedCategory && selectedCategory.color){
					return !todo.completed && todo.category.color === selectedCategory.color
				} else {
					return !todo.completed
				}
				case app.COMPLETED_TODOS:
				if (selectedCategory && selectedCategory.color){
					return todo.completed && todo.category.color === selectedCategory.color
				} else {
					return todo.completed
				}
				default:
					return true;
				}
			}, this);
			
			// Maps through the filtered todos and returns TodoItem component
			// with props passed through from parent to child
			var todoItems = shownTodos.map(function (todo) {
				return (
					<TodoItem
						key={todo.id}
						todo={todo}
						onToggle={this.toggle.bind(this, todo)}
						onDestroy={this.destroy.bind(this, todo)}
						onEdit={this.edit.bind(this, todo)}
						editing={this.state.editing === todo.id}
						onSave={this.save.bind(this, todo)}
						onCancel={this.cancel}
						handleChangeCategory={this.handleChangeCategory}
					/>
				);
			}, this);

			// Creating category list to display options for select menu
			var categoryList = app.CATEGORIES.map(function(categoryOption) { 
          		return (
          			<option key={categoryOption.id} name={categoryOption.name} value={categoryOption.id}>{categoryOption.name}</option>
          		)
          	}, this);

			// The following handle the logic for displaying todo count
			var activeTodoCount = todos.reduce(function (accum, todo) {
				return todo.completed ? accum : accum + 1;
			}, 0);

			var completedCount = todos.length - activeTodoCount;

			if (activeTodoCount || completedCount) {
				footer =
					<TodoFooter
						count={activeTodoCount}
						completedCount={completedCount}
						nowShowing={this.state.nowShowing}
						currentCategory={this.state.currentCategory}
						onClearCompleted={this.clearCompleted}
						handleCategoryView={this.handleCategoryView}
					/>;
			}

			// Renders todos if there is at least 1 in the array
			if (todos.length) {
				main = (
					<section className="main">
						<input
							className="toggle-all"
							type="checkbox"
							onChange={this.toggleAll}
							checked={activeTodoCount === 0}
						/>
						<ul className="todo-list">
							{todoItems}
						</ul>
					</section>
				);
			}

			// Renders the main todo app
			return (
				<div>
					<header className="header">
						<h1>todos</h1>
							<span className={classNames('todo-box')}>
								<input
									className={classNames('new-todo')}
									placeholder="What needs to be done?"
									value={this.state.newTodo.title}
									onKeyDown={this.handleNewTodoKeyDown}
									onChange={this.handleChange}
									autoFocus={true}
								/>
					            <select className={"category-select"} onChange={this.handleCategorySelect}>
					              <option name="None" value="none">Select category...</option>
					              {categoryList}
					            </select>
				            </span>
					</header>
					{main}
					{footer}
				</div>
			);
		}
	});

	var model = new app.TodoModel('react-todos');

	function render() {
		React.render(
			<TodoApp model={model}/>,
			document.getElementsByClassName('todoapp')[0]
		);
	}

	model.subscribe(render);
	render();
})();

