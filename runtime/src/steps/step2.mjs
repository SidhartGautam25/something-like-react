// work on components
/*

A component in your framework will be a mini-application of its own: 
it’ll have its own internal state and lifecycle, and it’ll be in charge 
of rendering a part of the view.


It’ll communicate with the rest of the application emitting
events, and receive props (data passed to the component from the outside),
re-rendering its view when a new set of props is passed to it.


Our first version of a component will be much simpler: a pure function 
that takes in the state of the whole application and returns the virtual 
DOM representing the view of the component.

In a later chapter, you’ll make components have their own internal state 
and lifecycle,

The view of an application depends on the state of the application, thus we
can say that the virtual DOM is a function of the state. 
Each time the state changes, the virtual DOM should be re-evaluated, and the
framework needs to update the real DOM accordingly. 




*/

// Components are functions that generate the virtual DOM for a part of the
// application’s view.

// They take the state of the application, or part of it, as their argument.
// The arguments passed to a component, the data coming from outside the
// component, are known as props

//  This definition of a component will change later

/*

=> For creating our functions now we will keep a scenerio in our mind
=> and that is a todo app
=> this todo app is divided into two component
        CreateTodo
        TodoList

=> So the virtual DOM for the whole application could be created by a
   component like the following:
  
   function App(state) {
       return hFragment([
            h('h1', {}, ['My TODOs']),
            CreateTodo(state),
            TodoList(state)
        ])
    } 
    
=>  Note that in this case, there isn’t a parent node in the virtual 
    DOM that contains the header of the application and the two 
    sub-components: 
            we use a fragment to group the elements together. 


    TodoList() component can be broken down into simpler component
    named TodoItem()


     and thus, the TodoList() component would look similar to the following:
            function TodoList(state) {
                return h('ul', {},
                    children: state.todos.map(
                    (todo, i) => TodoItem(todo, i, state.editingIdxs)
                    )
                )
            }
            

The TodoItem() component would render a different thing depending on
whether the to-do is in "read" or "edit" mode. Those could be further
decomposed into two different sub-components: TodoInReadMode() and
TodoInEditMode(). It’d be something like the following:
 
function TodoItem(todo, idxInList, editingIdxs) {
    const isEditing = editingIdxs.has(idxInList)
    return h('li', {}, [
        isEditing ? TodoInEditMode(todo, idxInList) : TodoInReadMode(todo, 
        idxInList)]
    )
}


 */
