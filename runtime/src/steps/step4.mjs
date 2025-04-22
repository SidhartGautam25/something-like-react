// in current step,we will work on state management of our current
// react like library

import { destroyDOM, mountDOM } from "./step3.mjs";

/*

So in current step,we will construct our own renderer,and to ensure 
the view reflects the current state,our renderer will completely 
destroys and mount the dom every time the state changes

So our renderer will do three things
    1. Completely destroy the current DOM (calling destroyDOM()).
    2. Produce the virtual DOM representing the view given the current state
       (calling the View() function, the top level component).
    3. Mount the virtual DOM into the real DOM (calling mountDOM())

To understand the complete workflow of our application which we are making
in this step is :

1. The USER
       -> interact with the application view 
                -> like clicking a button

2. The BROWSER
       -> dispatches a native javascript event(like MouseEvent etc)
    
3. The FRAMEWORK STATE MANAGER
       -> updates the state of the application 

4. The FRAMEWORK STATE MANAGER
       -> notifies the renderer that the state has been changed

5. The FRAMEWORK RENDERER
       -> re-render the view with the new state


*/

/*

                          THE REDUCER FUNCTION

our reducer function will not update the state by mutating it,it will
create a new state 

A reducer , in our context, is a function that takes the current state and a
payload (the command’s data) and returns a new updated state. These functions
never mutate the state that’s passed to them (mutation would be a side effect,
so the function wouldn’t bepure); instead, they create a new state.

The thing is there can be many reducer function so the question is how our
state manager will know which reducer function to execute when a command
has been recieved.
Something has to map the commands to the reducer functions.
We’ll call this mechanism a dispatcher ; 

*/

/*


But before doing anything we need to understand the diffrence between 
command and event

A command is a request to do something
event is like a notification

so in a scenerio where there is a todo app and let say there is an
button there to add something to your todo,then when you click something,
so now your application gets an notification that something has happened
.Now if you map a command to a event in your application,it means when
something happens and you get a notification of it,our application using 
our state manager and dispatcher executes that FUNCTION  which was attached
to that command.






*/

/*


                            A DISPATCHER

The association between commands and reducer functions is performed by an 
entity  we’ll call thedispatcher . 
The name reflects the fact that this entity is responsible for dis-patching 
the commands to the functions that handle the command—that is, for exe-cuting 
the corresponding handler functions in response to commands

These command handler functions are consumers

Consumer is the technical term for a function that accepts a single parameter
the command’s payload, in this case—and returns no value,

*/

export class Dispatcher_1 {
  // the hash in front of variable means that variable is a
  // private variable for the class
  #subs = new Map();

  subscribe(commandName, handler) {
    if (!this.#subs.has(commandName)) {
      this.#subs.set(commandName, []);
    }

    const handlers = this.#subs.get(commandName);
    if (handlers.includes(handler)) {
      return () => {};
    }
    handlers.push(handler);
    // basically subscribe function return a function when you call
    // later in your application it will remove the handler from the
    // subs map
    return () => {
      const idx = handlers.indexOf(handler);
      handlers.splice(idx, 1);
    };
  }
}
/*

As you can see,dispatcher is a class which has a private variable called
subs which is short for subscriptions.
      This variable is a javascript map to store the registered handlers
      by event name.
      And you can see that more than one handler can be registered to the
      same command name


The subscribe method takes a command name and a handler function as para-
meters,then check for an entry in subs for that command name,and creates
an entry with an empty array if there was no previous entry for that command.
Then it appends the handler to the array incase it wasn’t already registered. 
If the handler was already registered, you simply return a function that does
nothing because there’s nothing to unregister.

If the handler function was registered, thesubscribe() method returns a 
functionthat removes the handler from the corresponding array of handlers, 
so it’s never noti-fied again. First, you look for the index of the handler
in the array; then you call itssplice() method to remove the element at that
index.



*/

// dispatcher need to tell the renderer about the state change as our state
// manager is in charge of keeping the state in sync with the views

// The best time to notify the renderer about the state change is after the
// handlers for a given command has been executed
// We should allow the dispatcher to register special handler functions
// which we will call after command-handlers and are executed after the
// handlers for any dispatched command has been executed .
// The framework uses these handlers to notify the renderer about potential
// state changes, so it can update the view.

export class Dispatcher {
  // the hash in front of variable means that variable is a
  // private variable for the class
  #subs = new Map();
  #afterHandlers = [];

  subscribe(commandName, handler) {
    if (!this.#subs.has(commandName)) {
      this.#subs.set(commandName, []);
    }

    const handlers = this.#subs.get(commandName);
    if (handlers.includes(handler)) {
      return () => {};
    }
    handlers.push(handler);
    // basically subscribe function return a function when you call
    // later in your application it will remove the handler from the
    // subs map
    return () => {
      const idx = handlers.indexOf(handler);
      handlers.splice(idx, 1);
    };
  }

  // this method is just to inform the renderer about the state change
  afterEveryCommand(handler) {
    this.#afterHandlers.push(handler); // 1
    return () => {
      const idx = this.#afterHandlers.indexOf(handler);
      this.#afterHandlers.splice(idx, 1);
    };
  }

  dispatch(commandName, payload) {
    if (this.#subs.has(commandName)) {
      this.#subs.get(commandName).forEach((handler) => handler(payload));
    } else {
      console.warn(`No handler for command :${commandName}`);
    }
    this.#afterHandlers.forEach((handler) => handler());
  }
}

/*

Now before devloping the renderer we need to think about how to assemble
them because they need to communicate with each other for proper
working of application

So we need a "particular place" where we can bring them together

This can be an object that contains and connects them so they can 
communicate. if we think about this, this object represent the running
application that uses our library.And because of this we can refer this as
our application instance 



*/

/*

The application instance is the object that manages the lifecycle of the
application: it manages the state, renders the views, and updates the state in
response to user input.

There are three things that developers need to pass to the application
instance:
     1. The initial state of the application.
     2. The reducers that update the state in response to commands.
     3. The top-level component of the application.


The application instance can expose a mount() method that takes a DOM element
as parameter, mounts the application in it, and kicks off the application’s
lifecycle. 



*/

// state is our initial state of the application
// view is the top level component of the application

// We need two variables in the closure of the createApp() function:
// parentEl  and vdom.

// They keep track of the DOM element where the application is
// mounted and the virtual DOM tree of the previous view, respectively.

// They should both be initialized to null because the application
// hasn’t been mounted yet.
export function createApp({ state, view, reducers = {} }) {
  let parentEl = null;
  let vdom = null;

  const dispatcher = new Dispatcher();
  const subscriptions = [dispatcher.afterEveryCommand(renderApp)];

  // This is our renderer
  // it render our view
  /*

     But to render the view,it first destroy the current dom tree if
     it is there,and then mount the new one

     for now,our renderer is only called once,and this is when our
     application is mounted(by the mount method)
       
  */
  function renderApp() {
    if (vdom) {
      destroyDOM(vdom);
    }

    vdom = view(state);
    mountDOM(vdom, parentEl);
  }

  // This object is our application instance
  return {
    mount(parent) {
      parentEl = parent;
      renderApp();
    },
  };
}
