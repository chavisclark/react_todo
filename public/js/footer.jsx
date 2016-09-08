/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React */
var app = app || {};

(function () {
    'use strict';
    app.TodoFooter = React.createClass({
        
        render: function () {
            // Setting variables from this.props
            var { count, nowShowing, completedCount, 
                onClearCompleted, handleCategoryView, 
                currentCategory, option
            } = this.props;
            
            // Makes the item count seem a little for human :)
            var activeTodoWord = app.Utils.pluralize(count, 'item'),
                clearButton = null;
            
            // Creating category list from global categories
            var categoryList = app.CATEGORIES.map(function(categoryOption) { 
                return (
                    <option key={categoryOption.id} name={categoryOption.name} value={categoryOption.id}>{categoryOption.name}</option>
                )
            }, this);
            if (currentCategory.id === 'all') {
                option = <option name="All" value="all">Filter categories</option>
            } else {
                option = <option name={currentCategory.name} value={currentCategory.id}>**{currentCategory.name}</option>
            }
            // Handles the logic for displaying the clear completed link
            if (completedCount > 0) {
                clearButton = (
                    <button
                        className="clear-completed"
                        onClick={onClearCompleted}>
                        Clear completed
                    </button>
                );
            }

            // Renders the footer display
            return (
                <footer className="footer">
                    <span className="todo-count">
                        <strong>{count}</strong> {activeTodoWord} left
                    </span>
                    <ul className="filters">
                        <li>
                            <select onChange={handleCategoryView}>
                              {option}
                              {categoryList}
                            </select>
                        </li>
                        <li>
                            <a
                                href="#/"
                                className={classNames({selected: nowShowing === app.ALL_TODOS})}>
                                    All
                            </a>
                        </li>
                        {' '}
                        <li>
                            <a
                                href="#/active"
                                className={classNames({selected: nowShowing === app.ACTIVE_TODOS})}>
                                    Active
                            </a>
                        </li>
                        {' '}
                        <li>
                            <a
                                href="#/completed"
                                className={classNames({selected: nowShowing === app.COMPLETED_TODOS})}>
                                    Completed
                            </a>
                        </li>
                    </ul>
                    {clearButton}
                </footer>
            );
        }
    });
})();