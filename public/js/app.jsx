/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

var app = app || {};

(function () {
    'use strict';
    
    // Setting global properties for app
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
      {id: 'tda', name: 'The Dark Army', color: 'indigo'},
      app.NO_CATEGORY, app.ALL_CATEGORIES
    ];
    
    var TodoFooter = app.TodoFooter,
        TodoItem = app.TodoItem,
        toggleMe,
        freezeText = 'Freeze category',
        ENTER_KEY = 13;

    var TodoApp = React.createClass({
        getInitialState: function () {
            return {
                nowShowing: app.ALL_TODOS,
                currentCategory: app.ALL_CATEGORIES,
                editing: null,
                newTodo: '',
                newTodoCategory: app.NO_CATEGORY,
                toggleFreeze: null
            };
        },

        // Configuring the router for displaying filters for todos
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
                return;
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
                console.log(newCategory)
                this.setState({
                  newTodo: '',
                  currentCategory: newCategory,
                  newTodoCategory: this.state.toggleFreeze !== true ? app.NO_CATEGORY : newCategory
                });

                this.state.toggleFreeze !== true ? this.resetSelect() : '';
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
          var newCategoryFilter = [];
          // Filter the categories to find the matching id and return the first object
          newCategoryFilter = app.CATEGORIES.filter(function (category) {
            return category.id === event.target.value;
          });            

          this.setState({newTodoCategory: newCategoryFilter[0],
                         currentCategory: newCategoryFilter[0]
                        });
        },

        toggleFreeze: function () {
            if (toggleMe) {
                if (toggleMe.getAttribute('class') === 'off'){
                    toggleMe.setAttribute('class', 'on');
                    this.setState({toggleFreeze: true})
                    freezeText = 'Reset category';
                    return 'on'
                } else {
                    toggleMe.setAttribute('class', 'off');
                    this.setState({toggleFreeze: false, newTodoCategory: app.NO_CATEGORY});
                    this.resetSelect();
                    freezeText = 'Freeze category';
                    return 'off'
                }                
            }
        },

        resetSelect: function () {
            var sel = React.findDOMNode(this.refs.sel);
            sel.value = 'none';
        },

        render: function () {
            var footer, 
                main,
                option, 
                todos = this.props.model.todos, 
                selectedCategory = this.state.currentCategory;
                toggleMe = document.getElementById('toggleMe')

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
                    />
                );
            }, this);

            // Creating category list to display options for select menu
            var categories_ = app.CATEGORIES.filter(function(c) {
                return c.id !== 'all'
            })
            var categoryList = categories_.map(function(categoryOption) { 
                return (
                    <option key={categoryOption.id} name={categoryOption.name} value={categoryOption.id}>{categoryOption.name}</option>
                )
            }, this);

            // The following handle the logic for displaying todo count
            var activeTodoCount = todos.reduce(function (accum, todo) {
                return todo.completed ? accum : accum + 1;
            }, 0);

            var completedCount = todos.length - activeTodoCount;
            if (this.state.currentCategory.id === 'all') {
                option = <option name="None" value="none">Select category...</option>
            } else {
                option = <option name={this.state.currentCategory.name} value={this.state.currentCategory.id}>**{this.state.currentCategory.name}</option>
            }
            if (activeTodoCount || completedCount) {
                footer =
                    <TodoFooter
                        count={activeTodoCount}
                        completedCount={completedCount}
                        nowShowing={this.state.nowShowing}
                        currentCategory={this.state.currentCategory}
                        onClearCompleted={this.clearCompleted}
                        handleCategoryView={this.handleCategorySelect}
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
                                    placholder="What needs to be done?"
                                    value={this.state.newTodo.title}
                                    onKeyDown={this.handleNewTodoKeyDown}
                                    onChange={this.handleChange}
                                    autoFocus={true}
                                />
                                <select ref="sel" className={"category-select"} onChange={this.handleCategorySelect}>
                                  {option}
                                  {categoryList}
                                </select>
                                <div className='toggleBox'>
                                    <div className='tooltip'>
                                      <input id='toggleMe' className='off' onClick={this.toggleFreeze} type="button" />
                                      <span className='tooltiptext tooltip-right'>{freezeText}</span>
                                    </div>
                                </div>
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

