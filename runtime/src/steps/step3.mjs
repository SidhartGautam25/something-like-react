// create the real DOM nodes from the virtual DOM nodes, and insert them
// into the browser’s document.

import { DOM_TYPES, h } from "./step1.mjs";

/*

=> Mounting the VirtualDOM
        To create the real DOM tree out of vDOM and attach it to the 
        browser’s document.



When the mountDOM() function creates each of the DOM nodes for the virtual
DOM, it needs to save a reference to the real DOM node in the virtual node,
under the el property (el for element).
        This reference is used by the reconciliation algorithm  to know 
        what DOM nodes to update.

Similarly, if the node included event listeners, the mountDOM() function 
saves a reference to the event listener in the virtual node, under the 
listeners property.
        it allows the framework to remove the event listeners and detach the
        element from the DOM when the virtual node is unmounted. 

*/

/*

Different types of virtual nodes require different DOM nodes to be created,
namely:
    A virtual node of type text requires a Text node to be created (via the
    document.createTextNode() method).

    A virtual node of type element requires an Element node to be created
    (via the document.createElement() method).

*/

export function mountDOM(vdom, parent) {
  switch (vdom.type) {
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parent);
      break;
    }

    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parent);
      break;
    }

    case DOM_TYPES.FRAGMENT: {
      createFragmentNodes(vdom, parent);
      break;
    }

    default: {
      throw new Error(`Can't mount dom of type : ${vdom.type}`);
    }
  }
}

// mounting text nodes
function createTextNode(vdom, parentEl) {
  const { value } = vdom;
  const textNode = document.createTextNode(value); // 1
  vdom.el = textNode; // 2
  parentEl.append(textNode); // 3
}

// mounting fragment
function createFragmentNodes(vdom, parentEl) {
  const { children } = vdom;
  vdom.el = parentEl; // 1
  children.forEach((child) => mountDOM(child, parentEl)); // 2
}

// Now you’re ready to implement the createElementNode() function.
// It’s the most important one, because it’s the one that creates the element
// nodes; the visual bits of the DOM tree.

// mounting element nodes
/*

To create element nodes (those regular HTML elements with tags like <div> and
<span>), you use the createElement() method from the Document API.

You have to pass the tag name to the createElement() function, and the
Document API will return an element node that matches that tag, or
HTMLUnknownElement if the tag is unrecognized.


a <button> virtual node with a class of btn and an onclick event listener 
would look like this:
 
{

    type: DOM_TYPES.ELEMENT,
    tag: 'button',
    props: {
        class: 'btn',
        on: { click: () => console.log('yay!') }
    },
    children: [
        {
            type: DOM_TYPES.TEXT,
            value: 'Click me!'
        }
    ]
}


To create the corresponding DOM element from the virtual node, you need
to:
 1. Create the element node using the document.createElement() function.
 2. Add the attributes and event listeners to the element node, saving the
 added event listeners in a new property of the virtual node, called
 listeners.
 3. Save a reference to the element node in the virtual node, under the el
 property.
 4. Mount the children, recursively, into the element node.
 5. Append the element node to the parent element.



*/

function createElementNode(vdom, parentEl) {
  const { tag, props, children } = vdom;
  const element = document.createElement(tag); // 1
  addProps(element, props, vdom); // 2
  vdom.el = element;
  children.forEach((child) => mountDOM(child, element));
  parentEl.append(element);
}

function addProps(el, props, vdom) {
  const { on: events, ...attrs } = props; // 3
  vdom.listeners = addEventListeners(events, el); // 4
  setAttributes(el, attrs); // 5
}

/*

addEventListener()

To add an event listener to an element node, you call its method
addEventListener(). This method is available because an element node is an 
instance of the EventTarget interface. This interface—which declares the 
addEventListener() method—is implemented by all the DOM nodes that can 
receive events. All instances returned by calling document.createElement() 
implement the EventTarget interface, so you can safely call the
addEventListener() method on them.


Our implementation of the addEventListener() function for now is going to be
very simple:
        it’ll just call the addEventListener() method on the element and 
        return the event handler function it registered.

        You want to return the function registered as event handler, because 
        later on, when you implement the destroyDOM() method—which as you 
        can figure out it does the opposite of mountDOM()—you’ll need to 
        remove the event listeners to avoid memory leaks. You need the 
        handler function that was registered in the event listener to be able
        to remove it, by passing it as an argument to the 
        removeEventListener() method.



*/

// adding event listeners
// src/events.js
export function addEventListener(eventName, handler, el) {
  el.addEventListener(eventName, handler);
  return handler;
}

/*

the addEventListener() function is very simple. 
But, if we recall, the event listeners defined in a virtual node come packed 
in an object, where the keys are the event names and the values are the 
event handler functions, like so:
 {
  type: DOM_TYPES.ELEMENT,
  tag: 'button',
  props: {
    on: {
      mouseover: () => console.log('almost yay!'),
      click: () => console.log('yay!') ,
      dblclick: () => console.log('double yay!'),
    }
  }
 }
 
So it makes sense to have another function—if only for convenience—that
allows you to add multiple event listeners in the form of an object to an
element node.
*/

export function addEventListeners(listeners = {}, el) {
  const addedListeners = {};
  Object.entries(listeners).forEach(([eventName, handler]) => {
    const listener = addEventListener(eventName, handler, el);
    addedListeners[eventName] = listener;
  });
  return addedListeners;
}

// setting the attributes

/*

Ex:
   <p id="foo">Hello, world!</p>

   Assuming you have a reference to the <p> element in a variable called p, 
   you can set the id property of the p element to a different value, like so:
        p.id = 'bar'

   And the rendered HTML reflects the change:
        <p id="bar">Hello, world!</p>

*/

export function setAttributes(el, attrs) {
  const { class: className, style, ...otherAttrs } = attrs; // 1
  if (className) {
    setClass(el, className); // 2
  }
  if (style) {
    Object.entries(style).forEach(([prop, value]) => {
      setStyle(el, prop, value); // 3
    });
  }
  for (const [name, value] of Object.entries(otherAttrs)) {
    setAttribute(el, name, value); // 4
  }
}

/*
Ex:
   <div class="foo bar baz"></div>

In this case, the <div> element has three classes: foo, bar, and baz. Easy! But
now comes the tricky part: a DOM element (an instance of the Element class)
doesn’t have a class property, but instead has two properties, namely className
and classList, that are related to the class attribute. Let’s look at the 
classList first


The classList property returns an object, a DOMTokenList to be more specific,
that comes in pretty handy when you want to add, remove, or toggle classes on 
an element. A DOMTokenList object has an add() method, which takes multiple 
class names, and adds them to the element. 

Ex:  if you had a <div> element like the following:
     <div></div>

     and wanted to add the foo, bar, and baz classes to it, you could do it 
     like this:
      div.classList.add('foo', 'bar', 'baz')

    This would result in the following HTML:
    <div class="foo bar baz"></div>


Then is the className property
 , which is a string that contains the value of the class attribute. 
Following the example above, if you wanted to add the same three classes 
to the <div> element, you could do it like this:
        div.className = 'foo bar baz'

*/
// el.classname can be an array of class or an string containing
// multiple classes
function setClass(el, className) {
  el.className = ""; // 1
  if (typeof className === "string") {
    el.className = className; // 2
  }
  if (Array.isArray(className)) {
    el.classList.add(...className); // 3
  }
}

export function setStyle(el, name, value) {
  el.style[name] = value;
}
export function removeStyle(el, name) {
  el.style[name] = null;
}

// The setAttribute() function takes three arguments: an HTMLElement
// instance, the name of the attribute to set, and the value of the attribute.
export function setAttribute(el, name, value) {
  if (value == null) {
    removeAttribute(el, name);
  } else if (name.startsWith("data-")) {
    el.setAttribute(name, value);
  } else {
    el[name] = value;
  }
}
export function removeAttribute(el, name) {
  el[name] = null;
  el.removeAttribute(name);
}

// destroying the dom

/*


To destroy the DOM associated to a virtual node, you have to take into account
what type of node it is:
    text node—remove the text node from its parent element using the
            remove() method.
    fragment node—remove each of its children from the parent element,
            which if you recall, is referenced in the el property of the 
            fragment virtual node.
    element node—do the two previous things, plus remove the event
            listeners from the element.


In all of the cases, you want to remove the el property from the virtual node,
and in the case of an element node, also remove the listeners property. 
       This is so that you can tell that the virtual node has been destroyed 
       and allow the garbage collector to free the memory of the HTML element. 

When a virtual node doesn’t have an el property, you can safely assume that 
it’s not mounted to the real DOM, and therefore can’t be destroyed.

*/

export function destroyDOM(vdom) {
  const { type } = vdom;
  switch (type) {
    case DOM_TYPES.TEXT: {
      removeTextNode(vdom);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      removeFragmentNodes(vdom);
      break;
    }
    case DOM_TYPES.ELEMENT: {
      removeElementNode(vdom);
      break;
    }
    default: {
      throw new Error(`Can't destroy DOM of type: ${type}`);
    }
  }
  delete vdom.el;
}

function removeTextNode(vdom) {
  const { el } = vdom;
  el.remove();
}

// removing elements
function removeElementNode(vdom) {
  const { el, children, listeners } = vdom;
  el.remove();
  children.forEach(destroyDOM);
  if (listeners) {
    removeEventListeners(listeners, el);
    delete vdom.listeners;
  }
}

export function removeEventListeners(listeners = {}, el) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el.removeEventListener(eventName, handler);
  });
}
/*



As you can see we haven't removed el tag form the fragment like what we 
have done in element and textNodes and that is because el in case of
fragments dont refer to the fragment respective node in dom,but 
actually it point to parent of the fragment respective node and so we dont
want to remove those reference

*/
function removeFragmentNodes(vdom) {
  const { children } = vdom;
  children.forEach(destroyDOM);
}
